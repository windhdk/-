import request from '@/utils/request'
import md5 from 'js-md5'

export function login(username, password, code) {
  password = md5(password)
  return request({
    url: '/admin/admin/login',
    method: 'post',
    data: {
      username,
      password,
      code
    }
  })
}

export function getInfo() {
  return request({
    url: '/admin/admin/getinfo',
    method: 'post'
  })
}

export function logout() {
  return request({
    url: '/admin/admin/logout',
    method: 'post'
  })
}
