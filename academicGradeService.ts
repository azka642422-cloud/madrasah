export interface AcademicMapelScore {
  no: number;
  mapel: string;
  kitab: string;
  nilai: number | null;
}

export interface AcademicGradeRecord {
  nis: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  mapelScores: AcademicMapelScore[];
  madrasatulQuran: { kelancaran:number|null; makhroj:number|null; tajwid:number|null; };
  pengajianSore: number | null;
  akhlak: string;
  kerajinan: string;
  kerapian: string;
  absensi: { sakit:number|null; izin:number|null; alpha:number|null; };
  ranking: number | null;
  catatan: string;
  keputusan: string;
  musrif: string;
}

const PREFIX='annajiyah_prod_grade_';
const key=(tahunAjaran:string,semester:'Ganjil'|'Genap',nis:string)=>`${PREFIX}${tahunAjaran}_${semester}_${nis}`;
const emptyRecord=(nis:string,tahunAjaran:string,semester:'Ganjil'|'Genap',mapelScores:AcademicMapelScore[]=[]):AcademicGradeRecord=>({
  nis,tahunAjaran,semester,mapelScores,
  madrasatulQuran:{kelancaran:null,makhroj:null,tajwid:null},
  pengajianSore:null,akhlak:'',kerajinan:'',kerapian:'',
  absensi:{sakit:null,izin:null,alpha:null},ranking:null,catatan:'',keputusan:'',musrif:'',
});

export const academicGradeService={
  get(nis:string,tahunAjaran:string,semester:'Ganjil'|'Genap',defaultMapels:AcademicMapelScore[]=[]):AcademicGradeRecord{
    try{
      const raw=localStorage.getItem(key(tahunAjaran,semester,nis));
      if(!raw)return emptyRecord(nis,tahunAjaran,semester,defaultMapels);
      const parsed=JSON.parse(raw) as Partial<AcademicGradeRecord>;
      const base=emptyRecord(nis,tahunAjaran,semester,defaultMapels);
      return {...base,...parsed,nis,tahunAjaran,semester,
        mapelScores:Array.isArray(parsed.mapelScores)&&parsed.mapelScores.length?parsed.mapelScores:defaultMapels,
        madrasatulQuran:{kelancaran:parsed.madrasatulQuran?.kelancaran??null,makhroj:parsed.madrasatulQuran?.makhroj??null,tajwid:parsed.madrasatulQuran?.tajwid??null},
        absensi:{sakit:parsed.absensi?.sakit??null,izin:parsed.absensi?.izin??null,alpha:parsed.absensi?.alpha??null},
        akhlak:parsed.akhlak||'',kerajinan:parsed.kerajinan||'',kerapian:parsed.kerapian||'',
      };
    }catch{return emptyRecord(nis,tahunAjaran,semester,defaultMapels)}
  },
  save(record:AcademicGradeRecord):void{localStorage.setItem(key(record.tahunAjaran,record.semester,record.nis),JSON.stringify(record));},
};
