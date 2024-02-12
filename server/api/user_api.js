const express = require("express");

// import models so we can interact with the database
const {User, Admin} = require("../models/user");

// import authentication library
const auth = require("../middlewares/authJwt");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

// POST /api/user/tags
router.post("/tags", auth.verifyToken, async (req, res) => {
  try {
    const { u_id, tag, visibility, action } = req.body;
    let message;
    let tagbag = { tag, visibility };
    // 找到用户
    const user = await User.findById(u_id);
    if (!user) {
      return res.status(404).json({ message: "未找到用户" });
    }

    // 执行添加或删除标签操作
    if (action === "add") {
      user.tags.push(tagbag);
      message = "成功添加标签";
    } else if (action === "remove") {
      const index = user.tags.indexOf(tag);
      if (index !== -1) {
        user.tags.splice(index, 1);
        message = "成功删除标签";
      } else {
        return res.status(404).json({ message: "未找到此标签" });
      }
    } else {
      return res.status(400).json({ message: "非法操作" });
    }

    // 保存更新后的用户信息
    await user.save();
    res.status(200).json({ message: message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/user/tags/visibility
router.post("/tags/visibility", auth.verifyToken, async (req, res) => {
  try {
    const { user_id, tag, visibility } = req.body;

    // 找到用户
    const user = await User.findOne(user_id);
    if (!user) {
      return res.status(404).json({ message: "未找到用户" });
    }

    // 查找标签在用户模型中的索引
    const tagIndex = user.tags.findIndex(entry => entry[0] === tag);

    // 如果标签不存在于用户模型中，则添加新的标签及可见性信息
    if (tagIndex === -1) {
      user.tags.push({tag, visibility});
    } else {
      // 更新标签的可见性
      user.tags[tagIndex].visibility = visibility;
    }

    // 保存更新后的用户信息
    await user.save();

    res.status(200).json({ message: "成功更新标签可见性" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/user/admin
router.post("/admin", auth.verifyToken, async (req, res) => {
  try {
    const { admin_email, action } = req.body;

    // 查找常务管理员
    const adminUser = await Admin.findOne({ u_id: admin_email });
    if (!adminUser) {
      return res.status(404).json({ message: "未找到常务管理员" });
    }

    // 根据操作执行添加或删除常务管理员的操作
    if (action === "add") {
      // 添加常务管理员角色
      adminUser.role = 1; // 常務
      await adminUser.save();
      res.status(200).json({ message: "成功添加常务管理员" });
    } else if (action === "remove") {
      // 删除常务管理员角色
      adminUser.role = 0;
      await adminUser.save();
      res.status(200).json({ message: "成功删除常务管理员" });
    } else {
      res.status(400).json({ message: "非法操作" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// undo：启用或禁用用户等：需要在数据库方面进行改动支持，在user里添加一个是否封禁的属性。

// POST /api/user/ban
router.post("/ban",auth.verifyToken, async (req, res) => {
  try{
    const {uid,ban}=req.body;
    const user=await User.findById(uid)
    if (!user) {
      return res.status(404).json({ message: "未找到用户" });
    }
    user.ban=ban;
    await user.save();
    res.status(200).json({ message: "成功更改用户封禁状态" });
  }catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
