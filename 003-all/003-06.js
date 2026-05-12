// server/routes/auth.js - 仅供参考后端实现
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()

// 密码登录
router.post('/login/password', async (req, res) => {
  try {
    const { username, password, captcha } = req.body
    
    // 验证码校验
    // 查找用户
    const user = await User.findOne({ $or: [{ username }, { studentId: username }] })
    if (!user) {
      return res.json({ code: 400, message: '用户不存在' })
    }
    
    // 密码验证（bcrypt加密比对）
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.json({ code: 400, message: '密码错误' })
    }
    
    // 生成JWT Token
    const access_token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    )
    
    const refresh_token = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )
    
    res.json({
      code: 200,
      data: {
        access_token,
        refresh_token,
        user_info: {
          id: user.id,
          realName: user.realName,
          studentId: user.studentId,
          college: user.college,
          major: user.major,
          className: user.className
        }
      }
    })
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' })
  }
})

module.exports = router