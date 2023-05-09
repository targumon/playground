const H_MAX = 190
const H_OFFSET = 10
const T_OFFSET = 10
const bars = ['count', 'days']
const types = ['pm', 'cm']
const state = {pm: 0, cm: 0, per: 'fleet'}
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const handleVals = type => {
  $$(`.val.curr.${type}`).forEach(({classList}) => {
    classList.remove('show')
    setTimeout(() => classList.add('show'))
  })
}
const showDef = () => {
  $$('dt,dd').forEach(el => {
    el.style.display = el.classList.contains(`pm${state.pm}`) && el.classList.contains(`cm${state.cm}`) ? '' : 'none'
  })
}
const update = () => {
  showDef()
  writeTable()
  draw()
}
const validateState = () => {
  if (state.cm === 1 && state.pm === 1) {state.pm = 2}
}
const getOffer = name => {
  switch (name) {
    case 'baseline': return {pm: 0, cm: 0}
    case 'dynamic':  return {pm: 1, cm: 0}
    case 'prevent':  return {pm: 2, cm: 0}
    case 'detect':   return {pm: 0, cm: 1}
    case 'optimize': return {pm: 2, cm: 1}
    default: return {}
  }
}
const selectorClick = e => {
  if (e.target.dataset.offer) {
    $$('#selector .option').forEach(opt => opt.classList.toggle('selected', opt === e.target))
    Object.assign(state, getOffer(e.target.dataset.offer))
    handleVals('pm')
    handleVals('cm')
    update()
  }
}
const knobPmClick = () => {
  state.pm = (state.pm + 1) % 3
  validateState()
  handleVals('pm')
  update()
}
const knobCmClick = () => {
  state.cm = (state.cm + 1) % 2
  validateState()
  handleVals('cm')
  update()
}
const toggleClick = () => {
  state.per = state.per === 'fleet' ? 'vehicle' : 'fleet'
  $('.left').classList.toggle('selected', state.per === 'fleet')
  $('.right').classList.toggle('selected', state.per === 'vehicle')
  update()
}
selector.addEventListener('click', selectorClick)
knobPm.addEventListener('click', knobPmClick)
knobCm.addEventListener('click', knobCmClick)
toggle.addEventListener('click', toggleClick)

const data = {
  size: 90,
  pm: [
    {
      count: 491, // 643
      days: 491, // 2125
    },
    {
      count: 456, // 491
      days: 456, // 982
    },
    {
      count: 335,
      days: 335, // 670
    },
  ],
  cm: [
    {
      count: 1386,
      days: 2772, // 3311
    },
    {
      count: 1091,
      days: 2182,
    },
  ],
}

const perVal = val => state.per === 'fleet' ? val : (val / data.size).toFixed(1)
const writeTable = () => {
  $('table').style.opacity = (state.pm || state.cm) ? '1' : '0'
  const currC = data.pm[state.pm].count + data.cm[state.cm].count
  const baseC = data.pm[0].count + data.cm[0].count
  const currD = data.pm[state.pm].days + data.cm[state.cm].days
  const baseD = data.pm[0].days + data.cm[0].days
  saveSVal.textContent = `${- perVal(currC - baseC)} services`
  saveSPer.textContent = `${((1 - currC / baseC) * 100).toFixed(1)}%`
  saveDVal.textContent = `${- perVal(currD - baseD)} days`
  saveDPer.textContent = `${((1 - currD / baseD) * 100).toFixed(1)}%`
}

const calcYnH = (val, max) => {
  const height = val / max * H_MAX
  return {height, y: H_OFFSET + H_MAX - height}
}
const draw = () => {
  const {pm, cm} = state
  knobPmDot.style.transform = `rotate(${(pm -  1) / 8}turn)`
  knobCmDot.style.transform = `rotate(${(cm - .5) / 4}turn)`
  bars.forEach(bar => {
    const max = Math.max(data.pm[0][bar], data.cm[0][bar])
    types.forEach(type => {
      [0, type === 'pm' ? pm : cm].forEach((sel, i) => {
        const dataSet = i ? 'curr' : 'base'
        const o = calcYnH(data[type][sel][bar], max)
        const valEl = $(`.val.${dataSet}.${type}.${bar}`)
        valEl.textContent = perVal(data[type][sel][bar])
        valEl.setAttribute('y', o.y + T_OFFSET)
        Object.assign($(`.bar.${dataSet}.${type}.${bar}`).style, o)
      })
    })
  })
}
showDef()
draw()
