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
   * 创建一个数组,返回第一个参数的中不包括第二个参数的值
   * 采用 sameValueZero 比较方法, 0 和 -0 是相等的
   * @param {Array} array
   * @param {value | Array} other
   */
  function difference(array) {
    const other = Array.prototype.slice.call(arguments, 1)
    if (isArray(other)) {
      const toExclude = flattenDeep(other)
      return array.reduce((ret, it) => {
        if (!toExclude.includes(it)) ret.push(it)
        return ret
      }, [])
    } else {
      return array.reduce((ret, it) => {
        if (it !== other) ret.push(it)
        return ret
      }, [])
    }
  }

  /**
   * 类似 difference, 但接受一个 谓词函数 以比较 array, other 中的值
   *
   * @param {Array} array
   * @param [values](...array)
   * @param [iteratee = identify](Function)
   */
  function differenceBy(arr, ...args) {
    const predicate = isArray(last(args)) ? null : iteratee(args.pop())
    if (predicate === null) return difference(arr, args)

    const ret = []
    const toExclude = flattenDeep(args).map(it => predicate.call(null, it))
    for (let i = 0, len = arr.length; i < len; i++) {
      if (!toExclude.includes(predicate(arr[i]))) ret.push(arr[i])
    }
    return ret
  }

  /**
   * 类似 difference, 但会调用 比较函数来对比 array 的值和 values 值是否相等
   * compare 函数接受两个参数 arrVal, othVal
   * @param {Array} array
   * @param {values | Array} values
   * @param {Function} compare
   */
  function differenceWith(array, other, compare) {
    if (!isArray(other)) return array.slice()
    const ret = []
    for (let i = 0, len = array.length; i < len; i++) {
      const arrVal = array[i]
      if (!other.every(othVal => compare(arrVal, othVal))) ret.push(arrVal)
    }
    return ret
  }

  /**
   * 从 start 开始 用 value 填充 array, 直到 end(不包括 end)
   * 该方法会改变原数组
   * @param {Array} arr
   * @param {*} value
   * @param {number} [start=0]
   * @param {number} [end=arr.length]
   */
  function fill(arr, value, start = 0, end = arr.length) {
    for (let i = start; i < end; i++) {
      arr[i] = value
    }
    return arr
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
      const func = iteratee(predicate)
      if (!func(ary[i])) break
      ret = drop(ret, 1)
    }
    return ret
  }

  /**
   * 迭代数组, 返回第一个符合 谓词函数返回 true 的元素的下标, 可以指定迭代开始的位置
   * @param {Array} ary
   * @param {*} [predicate=identity] 接受三个参数, value, index/key, collection
   * @param {number} [fromIdx=0]
   */
  function findIndex(ary, predicate, fromIdx = 0) {
    for (let i = fromIdx, len = ary.length; i < len; i++) {
      const fn = iteratee(predicate)
      if (fn(ary[i], i, ary)) return i
    }
    return -1
  }

  /**
   * 类似 findIndex , 但是从后往前迭代数组, 返回第一个符合 谓词函数返回 true 的元素的下标, 可以指定迭代开始的位置
   * @param {Array} arr
   * @param {Function} predicate 接受三个参数, val, index/key, collection
   * @param {number} [fromIdx=arr.length - 1]
   */
  function findLastIndex(arr, predicate, fromIdx = arr.length - 1) {
    for (let i = fromIdx; i >= 0; i--) {
      const fn = iteratee(predicate)
      if (fn(arr[i], i, arr)) return i
    }
    return -1
  }

  /**
   * 迭代数组, 返回第一个符合 谓词函数返回 true 的元素, 可以指定迭代开始的位置
   * @param {Array} ary
   * @param {*} [predicate=identity] 接受三个参数, value, index/key, collection
   * @param {number} [fromIdx=0]
   */
  function find(ary, predicate, fromIdx = 0) {
    for (let i = fromIdx, len = ary.length; i < len; i++) {
      const fn = iteratee(predicate)
      if (fn(ary[i], i, ary)) return ary[i]
    }
    return void 0
  }

  /**
   * 返回数组的第一个元素
   *
   * @param {Array} array
   * @returns {*} value
   */
  function head(array) {
    return array[0]
  }

  /**
   * 返回数组的最后一项元素
   * @param {*} arr
   * @returns
   */
  function last(arr) {
    return arr[arr.length - 1]
  }

  /**
   *  返回一个对象, 键值对由 pairs 的 key-value 组成
   * [['a', 1], ['b', 2]] ---> {'a': 1, 'b': 2}
   * @param {Array} pairs
   * @returns {object} object
   */
  function fromPairs(pairs) {
    let ret = {}
    for (let i = 0, len = pairs.length; i < len; i++) {
      ret[pairs[i][0]] = pairs[i][1]
    }
    return ret
  }

  /**
   * 在 arr 中返回 value 第一次出现的位置, 没有出现则返回 -1. fromIdx 指定开始搜索的位置, 如果 fromIdx为负数则表示从末尾的偏移量
   * 使用 SameValueZero 比较
   * @param {Array} arr
   * @param {*} value
   * @param {number} [fromIdx=0]
   */
  function indexOf(arr, value, fromIdx = 0) {
    if (fromIdx < 0) {
      fromIdx = arr.length + fromIdx
    }
    for (let i = fromIdx, len = arr.length; i < len; i++) {
      if (compareBySameValueZero(arr[i], value)) return i
    }
    return -1
  }

  /**
   * 类似 indexOf, 但从后往前遍历数组, 返回匹配元素的下标
   * @param {Array} arr
   * @param {*} value
   * @param {number} [fromIdx=arr.length - 1]
   */
  function lastIndexOf(arr, value, fromIdx = arr.length - 1) {
    if (fromIdx < 0) fromIdx = arr.length + fromIdx
    for (let i = fromIdx; i >= 0; i--) {
      if (compareBySameValueZero(arr[i], value)) return i
    }
    return -1
  }

  /**
   * 获取包含除了最后一项元素以外的所有元素的数组
   * @param {*} arr
   * @returns
   */
  function initial(arr) {
    return arr.slice(0, arr.length - 1)
  }

  /**
   * 获取 包含所有交集 的数组
   * @param {array} (...Arrays) arrays
   * [2,1,2]
   */
  function intersection(...arrays) {
    const args = arrays.reduce((arr, it) => [...arr, ...uniq(it)], [])
    const map = {}
    return args.reduce((ret, it) => {
      if (map[it]) {
        ret.push(it)
        map[it] = true
      }
      map[it] = true
      return ret
    }, [])
  }

  /**
   * 类似 intersection , 但可以接受一个谓词函数
   * @param {[Array]|[Function]} 
   * @returns {Array}
   */
  function intersectionBy(...args) {
    const predicate = args.pop()
    if (isArray(predicate)) return []

    const map = {}
    const callback = iteratee(predicate)
    args = args.reduce((arr, it) => [...arr, ...uniq(it)], [])
    return args.reduce((ret, it, idx) => {
      const key = callback(it)
      switch (map[key]) {
        case void 0:
          map[key] = idx
          break;
        case false:
          break;
        default:
          ret.push(args[map[key]])
          map[key] = false
          break;
      }
      return ret
    }, [])
  }

  /**
   * 类似 intersection, 但接受一个比较函数来判断每一项值是否是交集
   * @param {Array} arr
   * @param {Function} comparator 接受两个参数 arrVal, otherVal
   * @returns
   */
  function intersectionWith(arr, ...args) {
    const comparator = args.pop()
    args = flattenDeep(args)
    const ret = []
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < args.length; j++) {
        if (comparator(arr[i], args[j])) {
          ret.push(arr[i])
          break
        }
      }
    }
    return ret
  }

  /**
   * 将数组转换为字符串, 按 separator 进行分割, separator 默认为逗号
   * @param {Array} arr
   * @param {string} [separator=',']
   * @returns {string}
   */
  function join(arr, separator = ',') {
    let ret = ""
    ret += arr[0]
    for (let i = 1; i < arr.length; i++) {
      ret = ret + separator + arr[i]
    }
    return ret
  }

  /**
   * 数组去重
   * @param {Array} arr
   * @returns {Array} 
   */
  function uniq(arr) {
    return Array.from(new Set(arr))
  }

  /**
   * 接受一个数组, 返回谓词函数为 true 的元素
   * @param {*} collection
   * @param {*} predicate
   * @returns {Array}
   */
  function filter(collection, predicate) {
    const ret = []
    const fn = iteratee(predicate) || identity
    for (let i = 0, len = collection.length; i < len; i++) {
      if (fn(collection[i], i, collection)) ret.push(collection[i])
    }
    return ret
  }

  /**
   * 返回数组中的第 n 个元素, 如果 n 是负数,则返回从右开始的第 n 个元素
   * @param {Array} array
   * @param {number} [n=0]
   */
  function nth(array, n = 0) {
    if (n < 0) {
      for (let i = array.length - 1; i >= 0; i--) {
        if (++n === 0) return array[i]
      }
    } else {
      for (let i = 0, len = array.length; i < len; i++) {
        if (i === n) return array[i]
      }
    }
  }

  /**
   * 从 arr 中移除给定的元素, 该方法会修改原数组
   * @param {Array} arr
   * @param [values] (...*): The values to remove.
   * @returns {Array}
   */
  function pull(arr, ...other) {
    for (let i = 0, len = arr.length; i < len; i++) {
      if (other.includes(arr[i])) arr.splice(i--, 1)
    }
    return arr
  }

  /**
   * 类似 pull, 但接受一个数组作为要移除的元素
   * @param {Array} arr
   * @param {Array} The values to remove.
   * @returns {Array}
   */
  function pullAll(arr, other) {
    for (let i = 0, len = arr.length; i < len; i++) {
      if (other.includes(arr[i])) arr.splice(i--, 1)
    }
    return arr
  }

  /**
   * 类似 pullAll, 但接受一个迭代器
   * @param {Array} arr
   * @param {Array} other
   * @param {Function} predicate
   * @returns
   */
  function pullAllBy(arr, other, predicate) {
    const shorthand = iteratee(predicate)
    for (let i = 0, len = arr.length; i < len; i++) {
      if (other.some(it => shorthand(it) === shorthand(arr[i]))) arr.splice(i--, 1)
    }
    return arr
  }

  /**
   * 类似 pullAll, 但接受一个比较函数
   * @param {Array} arr
   * @param {Array} other
   * @param {Function} compare 接受的参数为 arrVal, othVal
   */
  function pullAllWith(arr, other, compare) {
    if (!compare) return pullAll(arr, other)
    for (let i = 0, len = arr.length; i < len; i++) {
      if (other.some(it => compare(arr[i], it))) arr.splice(i--, 1)
    }
    return arr
  }

  /**
   * 从 arr 中移除 indexes 指定的下标上的元素, 该方法会修改原数组
   * @param {Array} arr
   * @param {Array}(...number) the indexes of element to remove
   * @returns {Array} 返回移除的元素组成的数组
   */
  function pullAt(arr, indexes) {
    const pulled = indexes.map(idx => arr[idx])
    pullAll(arr, pulled)
    return pulled
  }

  /**
   * 同原生函数 Array.prototype.reverse.
   * 该方法会修改原数组
   * @param {Array} arr
   */
  function reverse(arr) {
    if (!isArray(arr)) return arr
    let i = 0
    let j = arr.length - 1
    while (i < j) {
      swap(arr, i++, j--)
    }
    return arr
  }

  /**
   * 使用二分查找搜索 val 应插入 arr 的位置, 返回位置应尽量靠左
   * @param {Array} arr
   * @param {*} val
   * @returns {number} value 应插入的位置的下标
   */
  function sortedIndex(arr, val) {
    let idx = binarySearch(arr, val, false)
    if (idx < 0) return Math.abs(idx) - 1
    return idx
  }

  /**
   * 类似 sortedIndex, 但接受一个迭代器. 通过比对迭代器返回的值确认 val 应插入的位置
   * @param {Array} arr
   * @param {*} val
   * @param {} predicate
   * @returns {number}
   */
  function sortedIndexBy(arr, val, predicate) {
    const shorthand = iteratee(predicate) || identity
    return sortedIndex((arr.map(it => shorthand(it)), shorthand(val)))
  }

  /**
   * 类似 indexOf, 不同之处在于接受一个已经排序的数组, 二分查找 val 的下标, 返回可能的最低位的下标
   * @param {Array} arr
   * @param {*} val
   * @returns {number} 反会 val 在 arr 中的下标, 如果不存在则返回 - 1
   */
  function sortedIndexOf(arr, val) {
    arr = arr.sort((a, b) => a - b)
    const idx = binarySearch(arr, val, false)
    return idx < 0 ? -1 : idx
  }

  /**
   * 类似 sortedIndex, 但返回可能的最高索引
   * @param {Array} arr  The sorted array to inspect.
   * @param {*} The value to evaluate.
   * @returns {number} Returns the index at which value should be inserted into array.
   */
  function sortedLastIndex(arr, val) {
    let idx = binarySearch(arr, val, true)
    if (idx < 0) return Math.abs(idx) - 1
    return idx + 1
  }

  /**
   * 类似 sortedLastIndex 但接受一个迭代器
   * @param {*} arr
   * @param {*} val
   * @param {*} predicate
   * @returns {number}  Returns the index of the matched should be inserted into array
   */
  function sortedLastIndexBy(arr, val, predicate) {
    const shorthand = iteratee(predicate)
    return sortedLastIndex(arr.map(it => shorthand(it)), shorthand(val))
  }

  /**
   * 类似 sortedIndexOf , 但返回可能的最高位的下标
   * @param {Array} arr  The sorted array to inspect.
   * @param {*} The value to evaluate.
   * @returns {number}  反会 val 在 arr 中的下标, 如果不存在则返回 - 1
   */
  function sortedLastIndexOf(arr, val) {
    arr = arr.sort((a, b) => a - b)
    const idx = binarySearch(arr, val, true)
    return idx < 0 ? -1 : idx
  }

  /**
   * 类似 Java 中的 Arrays.binarySearch, 接受一个有序的数组和值(target), 
   * 如果数组中存在目标值则返回其对应的下标. 如果不存在则返回一个负数, 表达其应该插入的位置
   * @param {Array} ary
   * @param {value} target
   * @param {boolean} highest 若为true则返回可能的最高位索引, 为 false 则返回可能的最低位的索引
   * @param {number} [left=0]
   * @param {number} [right=ary.length]
   * @returns 存在target则返回下标, 不存在返回一个表示其应该插入的位置的负数. -1 表示应插入下标 0 的位置,  -2 表示应插入下标 1 的位置
   */
  function binarySearch(arr, target, highest = false, left = 0, right = arr.length) {
    let mid = null
    while (left < right) {
      mid = ~~(left + (right - left) / 2)
      switch (true) {
        case arr[mid] < target:
          left = mid + 1
          break;
        case arr[mid] > target:
          right = mid
          break
        default:
          if (highest) {
            if (arr[mid + 1] !== target) return mid
            left = mid + 1
          } else {
            if (arr[mid - 1] !== target) return mid
            right = mid
          }
          break;
      }
    }
    return left * -1 - 1
  }

  /**
   * 在原数组上交换元素的位置
   * @param {Array  } arr
   * @param {number} i the index of exchange element
   * @param {number} j the index of exchange element
   */
  function swap(arr, i, j) {
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
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
   * 判断一个值是否是正则表达式
   *
   * @param {*} value
   */
  function isRegExp(value) {
    return getTag(value) === '[object RegExp]'
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

  /**
   * 按 SameValueZero 进行比较
   * http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero
   * @param {*} x
   * @param {*} y
   * @returns {boolean}
   */
  function compareBySameValueZero(x, y) {
    if (getTag(x) !== getTag(y)) return false
    if (isNaN(x) && isNaN(y)) return true
    return x === y
  }

  return {
    chunk,
    compact,
    flatten,
    flattenDeep,
    flattenDepth,
    difference,
    differenceBy,
    differenceWith,
    fill,
    drop,
    dropRight,
    dropRightWhile,
    dropWhile,
    findIndex,
    findLastIndex,
    find,
    head,
    fromPairs,
    indexOf,
    lastIndexOf,
    initial,
    intersection,
    intersectionBy,
    intersectionWith,
    join,
    last,
    uniq,
    filter,
    nth,
    pull,
    pullAll,
    pullAllBy,
    pullAllWith,
    pullAt,
    reverse,
    sortedIndex,
    sortedIndexBy,
    sortedIndexOf,
    sortedLastIndex,
    sortedLastIndexBy,
    sortedLastIndexOf,

    binarySearch,
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
    isRegExp,
    get,
    negate,
    iteratee,
    identity,
    property,
    compareBySameValueZero
  }
}()