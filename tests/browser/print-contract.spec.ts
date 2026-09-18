import{test,expect}from'@playwright/test';
import fs from'node:fs';

test('print contract keeps official A4 report and certificate geometry',async({page})=>{
  await page.goto('/');await page.emulateMedia({media:'print'});
  const css=fs.readFileSync('frontend/src/app/app.css','utf8');
  expect(css).toMatch(/@page\{size:A4 portrait;margin:0\}/);
  expect(css).toMatch(/\.report-sheet,\.certificate-sheet\{width:210mm;height:297mm;min-height:297mm;max-height:297mm/);
  expect(css).toMatch(/break-after:page;page-break-after:always/);
  expect(css).toMatch(/\.report-sheet:last-child,\.certificate-sheet:last-child\{break-after:auto;page-break-after:auto\}/);
});

test('official Bahrul Ulum logo asset is packaged for certificate print',async()=>{
  expect(fs.existsSync('frontend/public/assets/logo-bahrul-ulum.jpg.jpeg')).toBeTruthy();
  expect(fs.statSync('frontend/public/assets/logo-bahrul-ulum.jpg.jpeg').size).toBeGreaterThan(0);
  const source=fs.readFileSync('frontend/src/features/certificates/CertificatePage.tsx','utf8');
  expect(source).toContain('/assets/logo-bahrul-ulum.jpg.jpeg');
  expect(source).not.toContain('<div className="certificate-logo">MADRASAH DINIYAH</div>');
});
