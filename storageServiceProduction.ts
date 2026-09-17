import type { SesiAbsensi } from './types';

/** Transitional compatibility layer. No demo/default institutional records. */
const KEYS = { students:'annajiyah_prod_students', tahunAjaran:'annajiyah_prod_tahun_ajaran', semester:'annajiyah_prod_semester', signatures:'annajiyah_prod_signatures', muhafadzoh:'annajiyah_prod_muhafadzoh', absensiSession:'annajiyah_prod_absensi_session', ijazahOverrides:'annajiyah_prod_ijazah_overrides' } as const;
const read=<T>(key:string,fallback:T):T=>{try{const raw=localStorage.getItem(key);return raw?(JSON.parse(raw) as T):fallback}catch{return fallback}};
const write=<T>(key:string,value:T):void=>localStorage.setItem(key,JSON.stringify(value));
export interface ProductionStudent { nis:string; nama:string; kelas:string; status?:string; foto?:string; tempatLahir?:string; tanggalLahir?:string; [key:string]:unknown; }
export interface ProductionSignatures { namaKepalaMadrasah?:string; titimangsaRaport?:string; titimangsaIjazah?:string; namaPengasuh?:string; nomorIjazahTemplate?:string; musrifPerKelas?:Record<string,string>; [key:string]:unknown; }
export interface ProductionMuhafadzoh { nis:string; materiMuhafadzoh?:string; kitabMuhafadzoh?:string; targetTahunan?:string; targetBait?:string|number; nilaiUjianMuhafadzoh?:number|null; nilaiMuhafadzoh?:number|null; [key:string]:unknown; }
export interface IjazahScore { no:number; mapel:string; angka:number; huruf?:string; }
export interface IjazahOverride { nomorIjazah?:string; statusKelulusan?:string; tempatLahir?:string; tanggalLahir?:string; tahunPelajaranHijriah?:string; tahunPelajaranMasehi?:string; periodeUjianHijriah?:string; periodeUjianMasehi?:string; tanggalDaftarNilai?:string; nilaiMapel?:IjazahScore[]; }
export type IjazahOverrides=Record<string,IjazahOverride>;
export const storageService={
 getStudents:():ProductionStudent[]=>read(KEYS.students,[]), saveStudents:(v:ProductionStudent[]):void=>write(KEYS.students,v),
 getTahunAjaran:():string=>read(KEYS.tahunAjaran,''), saveTahunAjaran:(v:string):void=>write(KEYS.tahunAjaran,v.trim()),
 getSemester:():'Ganjil'|'Genap'=>read(KEYS.semester,'Ganjil'), saveSemester:(v:'Ganjil'|'Genap'):void=>write(KEYS.semester,v),
 getSignaturesAndMusrif:():ProductionSignatures=>read(KEYS.signatures,{}), saveSignaturesAndMusrif:(v:ProductionSignatures):void=>write(KEYS.signatures,v),
 getMuhafadzohList:():ProductionMuhafadzoh[]=>read(KEYS.muhafadzoh,[]), saveMuhafadzohList:(v:ProductionMuhafadzoh[]):void=>write(KEYS.muhafadzoh,v),
 getAbsensiSession:():SesiAbsensi=>read(KEYS.absensiSession,{} as SesiAbsensi), saveAbsensiSession:(v:SesiAbsensi):void=>write(KEYS.absensiSession,v),
 getIjazahOverrides:():IjazahOverrides=>read(KEYS.ijazahOverrides,{}), saveIjazahOverride(nis:string,value:IjazahOverride):void{const all=read<IjazahOverrides>(KEYS.ijazahOverrides,{});all[nis]=value;write(KEYS.ijazahOverrides,all)}
};
