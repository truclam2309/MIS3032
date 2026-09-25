import os
import re
from pathlib import Path

import requests


# ============================================================
# CONFIG
# ============================================================

ROOT = Path(__file__).resolve().parents[1]

TAIGA_URL = os.getenv(
    "TAIGA_URL",
    "https://api.taiga.io"
).rstrip("/")

PROJECT_ID = os.getenv("TAIGA_PROJECT_ID")
TOKEN = os.getenv("TAIGA_TOKEN")


# ============================================================
# FIND USER STORIES FILE
# ============================================================

def find_user_stories_file():
    files = list(ROOT.rglob("user-stories*.md"))

    files = [
        f for f in files
        if f.is_file()
        and "node_modules" not in f.parts
    ]

    if not files:
        raise FileNotFoundError(
            f"Không tìm thấy user-stories.md trong:\n{ROOT}"
        )

    # Ưu tiên user-stories.md
    exact = [
        f for f in files
        if f.name.lower() == "user-stories.md"
    ]

    if exact:
        return exact[0]

    # Nếu không có thì lấy file mới sửa gần nhất
    return max(
        files,
        key=lambda f: f.stat().st_mtime
    )


# ============================================================
# PARSE EPIC
# ============================================================

EPIC_PATTERN = re.compile(
    r"^# (EPIC-\d+)\s+—\s+(.+?)\s*$",
    re.MULTILINE
)


# ============================================================
# PARSE USER STORY
# ============================================================

US_PATTERN = re.compile(
    r"^## (US-\d+)\s+—\s+(.+?)\s*$",
    re.MULTILINE
)


def normalize(text):
    return re.sub(
        r"\s+",
        " ",
        text.strip()
    ).casefold()


def extract_field(block, field):
    """
    Lấy nội dung:

    **Context:**
    ...

    **Out of Scope:**
    ...
    """

    pattern = re.compile(
        rf"\*\*{re.escape(field)}:\*\*\s*"
        r"(.*?)"
        r"(?=\n\n\*\*|\n\n---|\n\n#|\Z)",
        re.DOTALL
    )

    match = pattern.search(block)

    if not match:
        return ""

    return match.group(1).strip()


def extract_user_story(block):
    """
    Lấy dòng:

    **Là một Employee, tôi muốn...**
    """

    match = re.search(
        r"(\*\*Là một .*?\*\*)"
        r"\s*(?=\n\n\*\*Context:\*\*)",
        block,
        re.DOTALL
    )

    if not match:
        return ""

    return match.group(1).strip()


def extract_acceptance_criteria(block):
    match = re.search(
        r"\*\*Acceptance Criteria:\*\*"
        r"(.*?)"
        r"(?=\n\n\*\*Out of Scope:\*\*|\n\n\*\*Dependencies:\*\*|\Z)",
        block,
        re.DOTALL
    )

    if not match:
        return ""

    return match.group(1).strip()


# ============================================================
# PARSE MARKDOWN
# ============================================================

def parse_user_stories(text):

    epic_matches = list(
        EPIC_PATTERN.finditer(text)
    )

    us_matches = list(
        US_PATTERN.finditer(text)
    )

    epics = {}

    # --------------------------------------------------------
    # Parse Epic
    # --------------------------------------------------------

    for i, match in enumerate(epic_matches):

        epic_id = match.group(1)
        epic_name = match.group(2).strip()

        epics[epic_id] = {
            "id": epic_id,
            "name": epic_name,
            "stories": []
        }

    # --------------------------------------------------------
    # Parse US
    # --------------------------------------------------------

    for i, match in enumerate(us_matches):

        us_id = match.group(1)
        us_title = match.group(2).strip()

        start = match.start()

        if i + 1 < len(us_matches):
            end = us_matches[i + 1].start()
        else:
            end = len(text)

        block = text[start:end]

        # Tìm Epic gần nhất phía trước US
        epic_id = None

        for epic_match in epic_matches:

            if epic_match.start() < start:
                epic_id = epic_match.group(1)
            else:
                break

        if not epic_id:
            continue

        story = {
            "id": us_id,
            "title": us_title,

            "user_story": extract_user_story(
                block
            ),

            "context": extract_field(
                block,
                "Context"
            ),

            "acceptance_criteria":
                extract_acceptance_criteria(
                    block
                ),

            "out_of_scope": extract_field(
                block,
                "Out of Scope"
            ),

            "dependencies": extract_field(
                block,
                "Dependencies"
            ),

            "estimate": extract_field(
                block,
                "Estimate"
            )
        }

        epics[epic_id]["stories"].append(
            story
        )

    return list(epics.values())


# ============================================================
# BUILD TAIGA DESCRIPTION
# ============================================================

def build_description(story):

    sections = []

    if story["user_story"]:
        sections.append(
            story["user_story"]
        )

    if story["context"]:
        sections.append(
            "### Context\n\n"
            + story["context"]
        )

    if story["acceptance_criteria"]:
        sections.append(
            "### Acceptance Criteria\n\n"
            + story["acceptance_criteria"]
        )

    if story["out_of_scope"]:
        sections.append(
            "### Out of Scope\n\n"
            + story["out_of_scope"]
        )

    if story["dependencies"]:
        sections.append(
            "### Dependencies\n\n"
            + story["dependencies"]
        )

    if story["estimate"]:
        sections.append(
            "### Estimate\n\n"
            + story["estimate"]
        )

    return "\n\n".join(sections)


# ============================================================
# TAIGA CLIENT
# ============================================================

class TaigaClient:

    def __init__(self, base_url, token):

        self.base_url = base_url

        self.session = requests.Session()

        self.session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        })

    def get(self, endpoint, params=None):

        response = self.session.get(
            self.base_url + endpoint,
            params=params,
            timeout=30
        )

        response.raise_for_status()

        return response.json()

    def post(self, endpoint, data):

        response = self.session.post(
            self.base_url + endpoint,
            json=data,
            timeout=30
        )

        response.raise_for_status()

        return response.json()

    # --------------------------------------------------------
    # EPIC
    # --------------------------------------------------------

    def get_epics(self):

        return self.get(
            "/api/v1/epics",
            {
                "project": PROJECT_ID
            }
        )

    def create_epic(self, subject):

        return self.post(
            "/api/v1/epics",
            {
                "project": int(PROJECT_ID),
                "subject": subject
            }
        )

    # --------------------------------------------------------
    # USER STORY
    # --------------------------------------------------------

    def get_user_stories(self):

        return self.get(
            "/api/v1/userstories",
            {
                "project": PROJECT_ID
            }
        )

    def create_user_story(
        self,
        subject,
        description,
        epic_id
    ):

        data = {
            "project": int(PROJECT_ID),
            "subject": subject,
            "description": description
        }

        if epic_id:
            data["epic"] = epic_id

        return self.post(
            "/api/v1/userstories",
            data
        )


# ============================================================
# SYNC
# ============================================================

def sync():

    # --------------------------------------------------------
    # Check config
    # --------------------------------------------------------

    if not PROJECT_ID:

        print(
            "❌ Chưa có TAIGA_PROJECT_ID"
        )

        print(
            '\nPowerShell:'
        )

        print(
            '$env:TAIGA_PROJECT_ID="ID_PROJECT"'
        )

        return

    if not TOKEN:

        print(
            "❌ Chưa có TAIGA_TOKEN"
        )

        print(
            '\nPowerShell:'
        )

        print(
            '$env:TAIGA_TOKEN="TOKEN"'
        )

        return

    # --------------------------------------------------------
    # Find file
    # --------------------------------------------------------

    source = find_user_stories_file()

    print(
        f"\n📄 Đọc file:"
    )

    print(
        source
    )

    text = source.read_text(
        encoding="utf-8-sig"
    )

    # --------------------------------------------------------
    # Parse
    # --------------------------------------------------------

    epics = parse_user_stories(
        text
    )

    total_us = sum(
        len(epic["stories"])
        for epic in epics
    )

    print(
        f"\n📦 Epic tìm thấy: {len(epics)}"
    )

    print(
        f"📋 User Story tìm thấy: {total_us}"
    )

    # --------------------------------------------------------
    # Connect Taiga
    # --------------------------------------------------------

    taiga = TaigaClient(
        TAIGA_URL,
        TOKEN
    )

    try:

        existing_epics = taiga.get_epics()

        existing_stories = (
            taiga.get_user_stories()
        )

    except requests.RequestException as e:

        print(
            "\n❌ Không kết nối được Taiga:"
        )

        print(e)

        return

    # --------------------------------------------------------
    # Existing Epic
    # --------------------------------------------------------

    epic_map = {}

    for epic in existing_epics:

        subject = epic.get(
            "subject",
            ""
        )

        epic_map[
            normalize(subject)
        ] = epic

    # --------------------------------------------------------
    # Existing US
    # --------------------------------------------------------

    story_map = {}

    for story in existing_stories:

        subject = story.get(
            "subject",
            ""
        )

        story_map[
            normalize(subject)
        ] = story

    # --------------------------------------------------------
    # Counters
    # --------------------------------------------------------

    created_epics = 0
    existing_epic_count = 0

    created_us = 0
    existing_us_count = 0

    # ========================================================
    # SYNC EPIC + US
    # ========================================================

    for epic in epics:

        epic_subject = (
            f"{epic['id']} — "
            f"{epic['name']}"
        )

        key = normalize(
            epic_subject
        )

        # ----------------------------------------------------
        # Find / Create Epic
        # ----------------------------------------------------

        taiga_epic = epic_map.get(
            key
        )

        if taiga_epic:

            existing_epic_count += 1

            print(
                f"\n✓ Epic đã tồn tại:"
            )

            print(
                f"  {epic_subject}"
            )

        else:

            print(
                f"\n+ Tạo Epic:"
            )

            print(
                f"  {epic_subject}"
            )

            try:

                taiga_epic = (
                    taiga.create_epic(
                        epic_subject
                    )
                )

                created_epics += 1

                epic_map[key] = (
                    taiga_epic
                )

            except requests.RequestException as e:

                print(
                    f"❌ Lỗi tạo Epic:"
                )

                print(e)

                continue

        # ----------------------------------------------------
        # User Stories
        # ----------------------------------------------------

        for story in epic["stories"]:

            story_subject = (
                f"{story['id']} — "
                f"{story['title']}"
            )

            story_key = normalize(
                story_subject
            )

            # -----------------------------------------------
            # Already exists
            # -----------------------------------------------

            if story_key in story_map:

                existing_us_count += 1

                print(
                    f"  ✓ US đã tồn tại: "
                    f"{story_subject}"
                )

                continue

            # -----------------------------------------------
            # Description
            # -----------------------------------------------

            description = build_description(
                story
            )

            print(
                f"  + Tạo US: "
                f"{story_subject}"
            )

            try:

                created = (
                    taiga.create_user_story(
                        subject=story_subject,
                        description=description,
                        epic_id=taiga_epic.get("id")
                    )
                )

                story_map[
                    story_key
                ] = created

                created_us += 1

            except requests.RequestException as e:

                print(
                    f"  ❌ Lỗi tạo US:"
                )

                print(e)

    # ========================================================
    # RESULT
    # ========================================================

    print(
        "\n"
        + "=" * 55
    )

    print(
        "KẾT QUẢ SYNC TAIGA"
    )

    print(
        "=" * 55
    )

    print(
        f"Epic tạo mới      : {created_epics}"
    )

    print(
        f"Epic đã tồn tại   : {existing_epic_count}"
    )

    print(
        f"US tạo mới        : {created_us}"
    )

    print(
        f"US đã tồn tại     : {existing_us_count}"
    )

    print(
        f"Tổng Epic         : {len(epics)}"
    )

    print(
        f"Tổng US           : {total_us}"
    )

    print(
        "\n✅ Hoàn tất."
    )

    print(
        "Chạy lại script sẽ không tạo Epic/US trùng."
    )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    try:

        sync()

    except FileNotFoundError as e:

        print(
            f"\n❌ {e}"
        )

    except requests.RequestException as e:

        print(
            f"\n❌ Taiga API error:"
        )

        print(e)

    except Exception as e:

        print(
            f"\n❌ Lỗi:"
        )

        print(e)