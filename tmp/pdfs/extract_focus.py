from pypdf import PdfReader
from pathlib import Path

files = [
    Path(r"C:\Users\amy00\Downloads\annotated-Amina_Moosa_2750697.pdf"),
    Path(r"C:\Users\amy00\Downloads\Thawing_Memory_Theory_Fixes.pdf"),
]

for source in files:
    reader = PdfReader(str(source))
    print(f"\n===== {source.name} ({len(reader.pages)} pages) =====")
    for index, page in enumerate(reader.pages, 1):
        print(f"\n--- PAGE {index} TEXT ---\n{page.extract_text() or ''}")
        annotations = page.get('/Annots') or []
        for annotation_ref in annotations:
            annotation = annotation_ref.get_object()
            contents = annotation.get('/Contents')
            if contents:
                print(f"\n[ANNOTATION p.{index} subtype={annotation.get('/Subtype')}] {contents}")
