module.exports = function () {
  /**
   * 按 size 分割元素,  剩余元素将组成最后一部分
   * @param {Array} array
   * @param {number} [size=0]
   * @returns {Array}
   */
  function chunk(array, size = 0) {
    const ret = []
    for (let i = 0, len = array.length; i < len; i += size) {
      if (!isLength(i)) break
      ret.push(array.slice(i, i + size))
    }
    return ret
  }

  /**
   * 过滤数组中 false 的元素, 如 false, null, 0, "", NaN, undefined
   * @param {Array} array
   * @returns {Array}
   */
  function compact(array) {
    return array.filter(it => it)
  }

  /**
   * 展开多维数组, 只展开一层
   * @param {Array} array
   * @returns {Array}
   */
  function flatten(array) {
    const ret = []
    for (let i = 0, len = array.length; i < len; i++) {
      if (isArray(array[i])) {
        Array.prototype.push.apply(ret, array[i])
      } else {
        ret.push(array[i])
      }
    }
    return ret
  }

  /**
   * 递归展开多维数组, 
   * @param {Array} array
   * @returns {Array}
   */
  function flattenDeep(array) {
    const ret = []
    for (let i = 0, len = array.length; i < len; i++) {
      if (isArray(array[i])) {
        ret.push(...flattenDeep(array[i]))
      } else {
        ret.push(array[i])
      }
    }
    return ret
  }

  /**
   * 展开多维数组到指定深度
   * @param {Array} array
   * @param {number} [depth=1]
   * @returns {Array}
   */
  function flattenDepth(array, depth = 1) {
    const ret = []
    for (let i = 0, len = array.length; i < len; i++) {
      if (isArray(array[i]) && depth !== 0) {
        ret.push(...flattenDepth(array[i], depth -= 1))
      } else {
        ret.push(array[i])
      }
    }
    return ret
  }

  /**
   * 从左到右删除数组上的值, 返回新数组
   * @param {Array} array
   * @param {[number} [number=1] the number of element to drop
   * @returns {Array}
   */
  function drop(ary, number = 1) {
    if (Number.isInteger(number) && number >= 0) {
      return ary.slice(number)
    }
    return ary.slice()
  }

  /**
   * 类似 drop ,但是是从右往左删除, 返回新数组
   * @param {*} ary
   * @param {number} [number=1]
   * @returns {Array}
   */
  function dropRight(ary, number = 1) {
    if (Number.isInteger(number) && number > 0) {
      return ary.slice(0, -number)
    }
    return ary.slice()
  }

  /**
   * 类似 dropWhile, 但从右往左开始删除
   * @param {Array} ary
   * @param {} [predicate=identity]
   * @returns {Array}
   */
  function dropRightWhile(ary, predicate) {
    return dropWhile(ary.reverse(), predicate).reverse()
  }

  /**
   * 从左往右删除元素, 直到 predicate 返回 false 则停止删除
   * @param {*} ary
   * @param {*} [predicate=identity]
   */
  function dropWhile(ary, predicate) {
    let ret = ary.slice()
    for (let i = 0, len = ary.length; i < len; i++) {
      const negateFunc = iteratee(predicate)
      if (!negateFunc(ary[i])) break
      ret = drop(ret, 1)
    }
    return ret
  }

  /**
   * 
   * @param {Array} ary
   * @param {*} [predicate=identity]
   * @param {number} [fromIdx=0]
   */
  function findIndex(ary, predicate, fromIdx = 0) {
    for (let i = fromIdx, len = ary.length; i < len; i++) {
      const fn = iteratee(predicate)
      if (fn(ary[i])) return i
    }
    return -1
  }

  /**
   * 返回一个函数, 函数会比较给定对象 path 上的值是否 等于 sourceVal
   * @param {*} values
   * @returns
   */
  function MatchesProperty(path, sourceVal = null) {
    return function (object) {
      return isEqual(get(object, path), sourceVal)
    }
  }

  /**
   * @param {object} 要匹配属性值的对象
   * @return {Function} 
   */
  function Matches(source) {
    return function (object) {
      return isMatch(object, source)
    }
  }
  /**
   * 判断 object 是否是 source 的超集
   * @param {object} object
   * @param {object} source
   * @returns {boolean}
   */
  function isMatch(object, source) {
    if (object === source) return true
    for (const key in source) {
      if (!(key in object && isEqual(object[key], source[key]))) return false
    }
    return true
  }

  /**
   * 深度对比两个值是否相等,
   * 对象会对比它们自身的值是否相等, 不会判断继承来的可枚举属性
   * Note: isEqual(NaN, NaN) 应返回 true
   * TODO: 无法判断自定义类构造出的对象相等
   * @param {*} value
   * @param {*} other
   * @return {boolean}
   */
  function isEqual(value, other) {
    if (getTag(value) !== getTag(other)) return false // 类型判断
    if (isNaN(value) && isNaN(other)) return true // 都是 NaN 则返回 true

    if (isPlainObject(value)) {
      const keys1 = Object.keys(value).sort()
      const keys2 = Object.keys(other).sort()
      return isEqual(keys1, keys2) && keys1.every(key => isEqual(value[key], other[key]))
    }
    if (isArray(value)) {
      if (value.length !== other.length) return false
      for (let i = 0, len = value.length; i < len; i++) {
        if (!isEqual(value[i], other[i])) return false
      }
      return true
    }
    if (isObjectLike(value)) { // 由构造函数创建的非函数类型的值
      return value.valueOf() === other.valueOf()
      // return isEqual(value.valueOf(), other.valueOf())
    }

    return value === other // 对于基础类型即函数类型
  }

  function isString(value) {
    return typeof value === 'string' || (isObjectLike(value) && getTag(value) === '[object String]')
  }

  /**
   * 判断一个值是否是 Number 类型. Infinity -Infinity NaN 都返回 true
   * @param {*} value
   */
  function isNumber(value) {
    return typeof value === 'number' || (isObjectLike(value) && getTag(value) === '[object Number]')
  }

  /**
   * 判断一个值是否是 NaN
   * @param {*} value
   * @returns {boolean}
   */
  function isNaN(value) {
    return isNumber(value) && +value !== +value // 如果是 new Number()构造出的数字, 先将其转为原始类型的数字
  }

  /**
   * 判断一个值是有穷数
   * @param {*} value
   * @returns {boolean}
   */
  function isFinite(value) {
    return isNumber(value) && Number.isFinite(value)
  }

  /**
   * 判断一个值是否是 类数组
   * 类数组, 不是一个函数但是具有一个合法的 length 属性
   * 常见的类数组有: 字符串, DOMLIst,argument 对象
   * @param {*} value
   * @returns {boolean} 
   */
  function isArrayLike(value) {
    return !isFunction(value) && isLength(value.length)
  }

  /**
   * 判断值是否是 Array 类型
   * @param {*} value
   * @returns {boolean}
   */
  function isArray(value) {
    return isObject(value) && getTag(value) === '[object Array]'
  }

  /**
   * 判断一个值是否是 object-like 值
   * 在 isObject 的基础上排除了 null
   * @param {*} value
   * @returns {boolean} 
   */
  function isObjectLike(value) {
    return isObject(value) && !isFunction(value)
  }

  /**
   * 判断一个值是否是对象类型, (object, function, array, 以及通过 new 创造出来的值都是 对象类型
   * ! null 应该返回 false 而不是 true
   * @param {*} value
   * @returns {boolean}
   */
  function isObject(value) {
    const type = typeof value
    return value !== null && (type === 'object' || type === 'function')
  }

  /**
   * 判断值是狭义上的对象, 即 字面量对象, Object 构造函数创建出的对象 或 __proto__ 为 null 的对象(object.create(null))
   * @param {*} value
   * @returns {boolean}
   */
  function isPlainObject(value) {
    if (!isObjectLike(value) || getTag(value) !== '[object Object]') return false
    const prototype = Object.getPrototypeOf(value)
    if (prototype === null || prototype === Object.prototype) return true
    return false
  }

  /**
   * 判断一个值是否是函数类型
   * @param {*} value
   * @returns {boolean}
   */
  function isFunction(value) {
    return getTag(value) === '[object Function]'
  }

  /**
   * 即原生的 ES 方法 Object.prototype.toString
   * @param {*} value
   * @returns {string}
   */
  function getTag(value) {
    return Object.prototype.toString.call(value)
  }

  /**
   * 检测一个值是否是合法的类数组的 length 属性值, 即值必须小于最大安全正整数
   * @param {*} value
   * @returns {boolean} 
   */
  function isLength(value) {
    return isNumber(value) && Number.isInteger(value) && value >= 0 && value < Number.MAX_SAFE_INTEGER
  }

  /**
   * 返回一个函数, 对原函数的值取反
   * @param {Function} predicate
   * @returns {Function}
   */
  function negate(predicate) {
    return function (...args) {
      return !predicate(args)
    }
  }

  /**
   * 获取指定路径的值
   * @param {object} obj
   * @param {Array|string} path
   * @param {*} defaultVal
   * @returns {*} resolved value
   */
  function get(obj, path, defaultVal) {
    if (isString(path)) path = path.split(/\.|\[|\]/g).filter(it => it !== "")
    let r = path.reduce((obj, key) => obj === void 0 ? obj : obj[key], obj)
    return r === void 0 ? defaultVal : r
  }

  /**
   * Creates a function that invokes func with the arguments of the created function. 
   * 如果 func 是属性名, 返回一个 返回其属性值 的函数
   * 如果 func 是对象或数组, 返回一个 判断对象/数组 成员是否包含于参数的 的函数
   * func 数组的第一项被当成对象的 key 解析, 第二项被当成对象的值进行解析. 会忽略多余的参数
   * @param {string|Array|object} func
   * @returns {Function} 
   */
  function iteratee(func = identity(func)) {
    if (isString(func)) return property(func)

    if (isPlainObject(func)) return Matches(func)

    if (isArray(func)) return MatchesProperty(func[0], func[1])

    if (isFunction(func)) return func

  }

  /**
   * 返回一个函数, 根据属性名获取值
   * @param {*} propName
   * @returns {Function}
   */
  function property(propName) {
    return function (obj) {
      return get(obj, propName)
    }
  }

  /**
   * 该函数返回它接受的第一个参数
   * @param {*} value
   * @returns {*} value
   */
  function identity(value) {
    return value
  }

  return {
    chunk,
    compact,
    flatten,
    flattenDeep,
    flattenDepth,
    drop,
    dropRight,
    dropRightWhile,
    dropWhile,
    findIndex,
    MatchesProperty,
    Matches,
    isMatch,
    isEqual,
    isString,
    isNumber,
    isNaN,
    isFinite,
    isArrayLike,
    isArray,
    isObjectLike,
    isObject,
    isPlainObject,
    isFunction,
    getTag,
    isLength,
    get,
    negate,
    iteratee,
    identity,
    property,
  }
}()