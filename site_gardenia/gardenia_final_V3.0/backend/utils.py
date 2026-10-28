import uuid
import datetime


def new_id(prefix=""):
    return prefix + uuid.uuid4().hex[:8]


def today_str():
    return datetime.date.today().isoformat()


def now_hhmm():
    return datetime.datetime.now().strftime("%H:%M")


def only_digits(s):
    return "".join(ch for ch in (s or "") if ch.isdigit())
