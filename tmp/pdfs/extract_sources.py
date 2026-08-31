from pypdf import PdfReader
from pathlib import Path

files = [
    Path(r"C:\Users\amy00\Downloads\annotated-Amina_Moosa_2750697.pdf"),
    Path(r"C:\Users\amy00\Downloads\Thawing_Memory_Theory_Fixes.pdf"),
    Path(r"C:\Users\amy00\Desktop\Research HOSAG (GAI)\Bender et al. - 2021 - On the Dangers of Stochastic Parrots Can Language (1).pdf"),
    Path(r"C:\Users\amy00\Desktop\Research HOSAG (GAI)\Cartographies of Diaspora Contesting Identities (Gender, Racism, Ethnicity Series) by Avtar Brah (z-lib.org)-186-219 (1).pdf"),
    Path(r"C:\Users\amy00\Desktop\Research HOSAG (GAI)\hallculturalidentityanddiaspora.pdf"),
    Path(r"C:\Users\amy00\Desktop\Research HOSAG (GAI)\SAFIYA-NOBLE (1).pdf"),
    Path(r"C:\Users\amy00\Desktop\Research HOSAG (GAI)\Sarkar et al. - 2024 - When Copilot Becomes Autopilot Generative AI's Critical Risk to Knowledge Work and a Critical Solut.pdf"),
    Path(r"C:\Users\amy00\Desktop\Research HOSAG (GAI)\taylor-the-archive-and-the-reportoire-chapter1-pg22-73.pdf"),
]

for source in files:
    print(f"\n### {source.name}")
    try:
        reader = PdfReader(str(source))
        print(f"PAGES {len(reader.pages)}")
        body = "\n".join((page.extract_text() or "") for page in reader.pages)
        print(body[:24000].replace("\x00", " "))
    except Exception as error:
        print(f"ERROR {error!r}")
