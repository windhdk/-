import { asyncRouterMap, constantRouterMap } from '@/router'

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles_auth
 * @param route
 */
function hasPermission(roles_auth, route) {
  if (route.meta && route.meta.auth) {
    return roles_auth ? roles_auth.includes(route.name) : false
    // return true
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes asyncRouterMap
 * @param roles_auth
 */
// function filterAsyncRouter(routes, roles_auth) {
//   const res = []

//   routes.forEach(route => {
//     const tmp = { ...route }
//     if (hasPermission(roles_auth, tmp)) {
//       if (tmp.children) {
//         tmp.children = filterAsyncRouter(tmp.children, roles_auth)
//       }
//       res.push(tmp)
//     }
//   })

//   return res
// }

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: ''
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { roles_auth } = data
        console.log(data)
        const accessedRouters = asyncRouterMap.filter(v => {
          if (roles_auth.indexOf('admin') >= 0) return true
          if (hasPermission(roles_auth, v)) {
            if (v.children && v.children.length > 0) {
              v.children = v.children.filter(child => {
                if (hasPermission(roles_auth, child)) {
                  return child
                }
                return false
              })
              return v
            } else {
              return v
            }
          }
          return false
        })
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })

      // return new Promise(resolve => {
      //   console.log(data)
      //   const { admin_id } = data
      //   const { roles_auth } = data
      //   let accessedRouters
      //   if (admin_id === 1) {
      //     accessedRouters = asyncRouterMap
      //   } else {
      //     accessedRouters = filterAsyncRouter(asyncRouterMap, roles_auth)
      //     console.log(123)
      //     console.log(accessedRouters)
      //   }
      //   commit('SET_ROUTERS', accessedRouters)
      //   resolve()
      // })
    }
  }
}

export default permission
