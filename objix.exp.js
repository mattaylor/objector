const
  P = Object.prototype,
  F = Object.fromEntries,
  K = Object.keys,
  A = Object.assign

let chain = f => function(...a) { 
  f(this, ...a)
  return this
}

for (let f of ['keys', 'values', 'entries', 'create']) P[f] = function() {
  return Object[f](this)
}

P.every = function(f) {
  for (let k of K(this)) if (!f(this[k], k)) return false
  return true
}

P.some = function(f) {
  for (let k of K(this)) if (f(this[k], k)) return true
  return false
}

P.map = function(f) {
  let r = {}
  for (let k of K(this)) r[k] = f(this[k],k)
  return r
}

P.has = function(v) {
  return this.find(_ => _.equals(v))
}

P.filter = function(f) {
  return F(K(this).flatMap(k => f(this[k],k) ? [[k,this[k]]] : []))
}

P.flatMap = function(f) {
  return F(K(this).flatMap(k => f(k,this[k])))
}

P.clean = function() {
  return F(K(this).flatMap(k => this[k] ? [[k,this[k]]] : []))
}

P.isArray = function() {
  return this instanceof Array
}

P.type = function() {
  return this.constructor.name
}

P.isString = function() {
  return this._type() == 'String'
}

P.find = P.find = function(f) {
  for (let k of K(this)) if (f(this[k],k)) return k
}

P.assign = function(...a) {
  return A(this, ...a)
}

P.extend = function(...a) {
  return A({}, ...a, this)
}

P.delete = chain((t, ...a) => { for (let k of a) delete t[k]})

P.json = function() {
  return JSON.stringify(this)
}

P.clone = function(d) {
  return this.size() && !this.isString() 
    ? this.constructor().assign(this.map(v => d && v ? v.clone(d-1) : v))
    : this
}

P.join = function(...a) {
  let r = A({}, this)
  for(let o of a) K(o).map(k => r[k] &&= [].concat(r[k], o[k]))
  return r
}

P.split = function() {
  let r = []
  for (let k of K(this)) this[k].map((v,i) => r[i] ? r[i][k] = v : r[i] = {[k]: v})
  return r
}

P.common = function(o) {
  return F(K(this).flatMap(k => (o[k] == this[k]) ? [[k,this[k]]] : []))
}

P.contains = function(o, d) {
  for (let k of K(o)) if (this[k] != o[k] && !(d && this.some(v => v.contains(o, d-1)))) return false
  return true
}

P.equals = function(o, d) {
  return this == o
    || this.type() == o.type()
    && this.size() == o.size()
    && !(this-o)
    && this.every((v,k) => v == o[k] || d && v?.equals(o[k],d-1))
}

P.size = function() {
  return K(this).length
}

P.keyBy = chain((t,a,k) => a.map(o => t[o[k]] = t[o[k]] ? [o].concat(t[o[k]]) : o))

P.bind = chain((t,k,f) => t[k] = function(...a) { return f(t, ...a) })

P.log = chain((t,m='',c='log') => console[c](new Date().toISOString().slice(0,-8), m, t.clone(-1)))

P.new = function(o) {
  return this._t ? new Proxy(this._t.new(o), this._h) : this.create().assign(o)
}

P.trap = function(f, e, ...p) {
  return new Proxy(this, {
    set(t,k,v) {
      if ((!p[0] || p.has(k)) && !f(v,k,t) && e) throw([e,k,v]+'')
      return t[k] = v
    },
    get(t,k) {
      return {_t:t, _h:this}[k] || t[k]
    }
  })
}

for (let f of K(P)) if (f[0] != '_') {
  P['_'+f] = P[f]
  try { module.exports[f] = (o, ...args) => o['_'+f](...args) } catch {}
}