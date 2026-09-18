import{test,expect}from'@playwright/test';
import fs from'node:fs';

test('print contract keeps official A4 report and certificate geometry',async({page})=>{
  await page.goto('/');
  await page.emulateMedia({media:'print'});
  const contract=await page.evaluate(()=>{const css=[...document.styleSheets].flatMap(s=>{try{return[...s.cssRules].map(r=>r.cssText)}catch{return[]}}).join('\n');return{hasA4:/@page[^}]*size:\s*A4 portrait/i.test(css),report:/\.report-sheet[^}]*width:\s*210mm[^}]*height:\s*297mm/i.test(css),certificate:/\.certificate-sheet[^}]*width:\s*210mm[^}]*height:\s*297mm/i.test(css),pageBreak:/page-break-after:\s*always|break-after:\s*page/i.test(css)}});
  expect(contract.hasA4).toBeTruthy();expect(contract.report).toBeTruthy();expect(contract.certificate).toBeTruthy();expect(contract.pageBreak).toBeTruthy();
});

test('official Bahrul Ulum logo asset is packaged for certificate print',async()=>{
  expect(fs.existsSync('frontend/public/assets/logo-bahrul-ulum.jpg.jpeg')).toBeTruthy();
  const source=fs.readFileSync('frontend/src/features/certificates/CertificatePage.tsx','utf8');
  expect(source).toContain('/assets/logo-bahrul-ulum.jpg.jpeg');
  expect(source).not.toContain('<div className="certificate-logo">MADRASAH DINIYAH</div>');
});
