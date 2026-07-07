export function getTzDate(dateInput: Date | string): Date {
  let date: Date
  if (typeof dateInput === 'string') {
    if (!dateInput.includes('-03:00') && !dateInput.includes('Z') && !dateInput.includes('+') && !/T\d{2}:\d{2}:\d{2}/.test(dateInput)) {
      date = new Date(dateInput + 'T00:00:00-03:00')
    } else if (dateInput.includes('T') && !dateInput.includes('-03:00') && !dateInput.includes('Z') && !dateInput.includes('+')) {
      date = new Date(dateInput + '-03:00')
    } else {
      date = new Date(dateInput)
    }
  } else {
    date = dateInput
  }
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  })
  
  const parts = formatter.formatToParts(date)
  const getVal = (type: string) => parseInt(parts.find(p => p.type === type)!.value, 10)
  
  const year = getVal('year')
  const month = getVal('month') - 1
  const day = getVal('day')
  const hour = getVal('hour')
  const minute = getVal('minute')
  const second = getVal('second')
  
  return new Date(year, month, day, hour, minute, second)
}

export function formatDate(dateInput: Date | string, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }): string {
  return new Intl.DateTimeFormat('pt-BR', {
    ...options,
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(dateInput))
}

export function formatTime(dateInput: Date | string, options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }): string {
  return new Intl.DateTimeFormat('pt-BR', {
    ...options,
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(dateInput))
}
