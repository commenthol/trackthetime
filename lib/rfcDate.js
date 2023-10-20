const REdmy = /^(\d{1,2})[./](\d{1,2})[./]?(\d{1,4}|)$/

const REiso = /^(?:([0-9]{1,4})-|)(\d{1,2})-(\d{1,2})$/

function int (str) {
  return parseInt(str, 10)
}

function toIsoDate (y, m, d) {
  y = int(y || new Date().getFullYear())
  const date = new Date(0)

  date.setUTCFullYear(y < 100 ? y + 2000 : y)
  date.setUTCMonth(int(m) - 1)
  date.setUTCDate(int(d))
  if (!isNaN(date.getTime())) {
    return date.toISOString().substring(0, 10)
  }
}

function rfcDate (str) {
  const dmy = REdmy.exec(str)
  if (dmy) {
    return toIsoDate(dmy[3], dmy[2], dmy[1])
  }
  const iso = REiso.exec(str)
  if (iso) {
    return toIsoDate(iso[1], iso[2], iso[3])
  }
}

const REduration = /^([+]|)(?:(\d{1,2}):|)(\d{1,3})$/

function timeOrDuration (str) {
  const m = REduration.exec(str)
  if (m) {
    // eslint-disable-next-line no-unused-vars
    const [_, isDuration, hours, minutes] = m
    const secs = Math.min((int(hours || 0) * 60 + int(minutes || 0)) * 60, 24 * 3600)
    if (isDuration) {
      return [undefined, secs]
    } else {
      const hours = (secs / 3600) | 0
      const minutes = (secs % 3600) / 60 | 0
      const time = [hours, minutes].map(s => String(s).padStart(2, '0')).join(':')
      return [time]
    }
  }
  return []
}

module.exports = {
  rfcDate,
  timeOrDuration
}
