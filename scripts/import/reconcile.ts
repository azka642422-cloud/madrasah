export type OfficialStudent={id:number;nis:string;name:string;classCode?:string|null};
export type SourceStudent={nis?:string|null;name?:string|null;classCode?:string|null};
export type MatchResult={studentId?:number;status:'EXACT_OFFICIAL_NIS'|'NAME_CLASS_REVIEW'|'AMBIGUOUS'|'UNMATCHED';candidates:number[]};

const norm=(v?:string|null)=>String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('id-ID');
const normNis=(v?:string|null)=>String(v??'').normalize('NFKC').trim();

/**
 * Word-derived official NIS is the only automatic identity match.
 * Name/class matches are suggestions requiring human approval; they are never auto-imported.
 */
export function reconcileStudent(source:SourceStudent,official:OfficialStudent[]):MatchResult{
 const nis=normNis(source.nis);
 if(nis){const exact=official.filter(s=>normNis(s.nis)===nis);if(exact.length===1)return{studentId:exact[0]!.id,status:'EXACT_OFFICIAL_NIS',candidates:[exact[0]!.id]};if(exact.length>1)return{status:'AMBIGUOUS',candidates:exact.map(s=>s.id)};}
 const name=norm(source.name);if(!name)return{status:'UNMATCHED',candidates:[]};
 const sameName=official.filter(s=>norm(s.name)===name);
 const cls=norm(source.classCode);
 const narrowed=cls?sameName.filter(s=>norm(s.classCode)===cls):sameName;
 if(narrowed.length===1)return{studentId:narrowed[0]!.id,status:'NAME_CLASS_REVIEW',candidates:[narrowed[0]!.id]};
 if(narrowed.length>1||sameName.length>1)return{status:'AMBIGUOUS',candidates:(narrowed.length?narrowed:sameName).map(s=>s.id)};
 return{status:'UNMATCHED',candidates:[]};
}
