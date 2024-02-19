const express = require("express");

// import models so we can interact with the database
const Story = require("../models/story");
const { StoryComment, ActivityComment, MemberComment } = require("../models/comment");
const User = require("../models/user");
const Activity = require("../models/activity");
const Settings = require("../models/settings");

// 初始化设置
// 贴子发布功能默认为开启状态
async function initializeSettings() {
  const existingSettings = await Settings.findOne();

  if (!existingSettings) {
    const defaultSettings = new Settings();
    await defaultSettings.save();
  }
}

initializeSettings().catch(console.error);

// import authentication library
const auth = require("../middlewares/authJwt");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

// 获取帖子发布功能开启状态
// 无请求体
// 返回体形如：{ storyPostingEnabled: *true/false* }
// 未知错误时返回400状态码和{ message: *错误信息* }
// GET /api/story/global-settings
router.get("/global-settings", auth.verifyToken, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.status(200).json({ settings });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 修改帖子发布功能开启状态-需要系统管理员权限
// 请求体形如：{ storyPostingEnabled: *true/false* }
// 返回体形如：{ message: `帖子发布功能开启状态已修改为${req.body.storyPostingEnabled}。` }
// 未知错误时返回400状态码和{ message: *错误信息* }
// PUT /api/story/global-settings
router.put("/global-settings", auth.verifyToken, auth.isSysAdmin, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    settings.storyPostingEnabled = req.body.storyPostingEnabled;
    await settings.save();
    res.status(200).json({ message: `帖子发布功能开启状态已修改为${req.body.storyPostingEnabled}。` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/story/stories
router.get("/stories", (req, res) => {
  // empty selector means get all documents
  Story.find({}).then((stories) => res.send(stories));
});

// POST /api/story
// 如果帖子发布功能被禁用，返回403状态码和{ message: "帖子发布功能已被禁用。" }
router.post("/", auth.verifyToken, async (req, res) => {
  // 确认发布帖子功能是否被开启
  const settings = await Settings.findOne();
  if (settings.storyPostingEnabled === false) {
    return res.status(403).json({ message: "帖子发布功能已被禁用。" });
  }
  const { creator_id, creator_name, title, content } = req.body;
  const newStory = new Story({
    creator_id: creator_id,
    creator_name: creator_name,
    title: title,
    content: content,
  });

  newStory.save().then((story) => res.send(story));
});

// POST /api/story/comment
// 如果帖子回复功能被禁用，返回403状态码和{ message: "帖子回复功能已被禁用。" }
router.post("/comment", auth.verifyToken, async (req, res) => {
  try {
    const { creator, send_date, story_id, comment } = req.body;
    const story = await Story.findById(story_id);
    if (story.canBeReplied === false) {
      return res.status(403).json({ message: "帖子回复功能已被禁用。" });
    }
    const newComment = new StoryComment({
      creator: creator,
      send_date: send_date,
      story_id: story_id,
      comment: comment
    });
    // Save the new activity to the database
    story.comments.push(newComment._id);
    await story.save();
    await newComment.save().then((comment) => res.send(comment));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/story/comment
router.get("/comment", auth.verifyToken, async (req, res) => {
  try {
    const comment = await StoryComment.findById(req.query.commentid, (err, comment) => {
      if (err) {
        console.log(err);
      } else {
        // DEBUG
        //console.log(comment);
      }
    });
    res.set('Content-Type', 'application/json');
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }
    res.status(200).json({ comment: comment, message: "Comment sent." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 删除自己发送的帖子及其评论
// 无需请求体。请构造形如 /api/story/*需要删除的story的_id*/ 的DELETE请求。
// 返回体形如：{ story: *被删除的story对象*, comments: [*被删除的属于被删除的story对象的comment*], message: "帖子已删除。" }
// 未找到帖子时返回404状态码和{ message: "没有找到帖子。" }
// 请求删除的帖子不属于当前用户时返回403状态码和{ message: "权限不足！" }
// 未知错误时返回400状态码和{ message: *错误信息* }
// DELETE /api/story/:id
router.delete("/:id", auth.verifyToken, async (req, res) => {
  try {
    const storyToBeDeleted = await Story.findById(req.params.id, (err, storyToBeDeleted) => {
      if (err) {
        console.log(err);
      } else {
        // DEBUG
        console.log(storyToBeDeleted);
      }
    });
    if (!storyToBeDeleted) {
      return res.status(404).json({ message: "没有找到帖子。" });
    }
    if (storyToBeDeleted.creator_id !== req.userId) {
      return res.status(403).json({ message: "没有删除的权限！" });
    }
    let jsonToBeReturned = {
      story: storyToBeDeleted,
      comments: []
    };
    for (let i = 0; i < storyToBeDeleted.comments.length; i++) {
      await StoryComment.findByIdAndDelete(storyToBeDeleted.comments[i]).then((err, comment) => {
        if (err) {
          console.log(err);
        }
        jsonToBeReturned.comments.push(comment);
      });
    }
    await storyToBeDeleted.deleteOne({ story_id: storyToBeDeleted._id }).then(() => {
      jsonToBeReturned.message = "帖子已删除。";
      res.status(200).json(jsonToBeReturned);
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 删除任意帖子及其评论-需要常务管理员以上的权限
// 无需请求体。请构造形如 /api/story/deleteany/*需要删除的story的_id*/ 的DELETE请求。
// 返回体形如：{ story: *被删除的story对象*, comments: [*被删除的属于被删除的story对象的comment*], message: "帖子已删除。" }
// 未找到帖子时返回404状态码和{ message: "没有找到帖子。" }
// 未知错误时返回400状态码和{ message: *错误信息* }
// DELETE /api/story/deleteany/:id
router.delete("/deleteany/:id", auth.verifyToken, auth.hasExecutiveManagerPrivileges, async (req, res) => {
  try {
    const storyToBeDeleted = await Story.findById(req.params.id, (err, storyToBeDeleted) => {
      if (err) {
        console.log(err);
      } else {
        // DEBUG
        console.log(storyToBeDeleted);
      }
    });
    if (!storyToBeDeleted) {
      return res.status(404).json({ message: "没有找到帖子。" });
    }
    let jsonToBeReturned = {
      story: storyToBeDeleted,
      comments: []
    };
    for (let i = 0; i < storyToBeDeleted.comments.length; i++) {
      await StoryComment.findByIdAndDelete(storyToBeDeleted.comments[i]).then((err, comment) => {
        if (err) {
          console.log(err);
        }
        jsonToBeReturned.comments.push(comment);
      });
    }
    await storyToBeDeleted.deleteOne({ story_id: storyToBeDeleted._id }).then(() => {
      jsonToBeReturned.message = "帖子已删除。";
      res.status(200).json(jsonToBeReturned);
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 修改帖子置顶状态-需要常务管理员以上的权限
// 请求体形如：{ storyid: *story的_id*, isPinned: *true/false* }
// 返回体形如：{ message: `_id为${req.body.storyid}的帖子的置顶状态已被修改为${req.body.isPinned}。" }
// 未找到帖子时返回404状态码和{ message: "没有找到帖子。" }
// 未知错误时返回400状态码和{ message: *错误信息* }
// PATCH /api/story/pinned-state
router.patch("/pinned-state", auth.verifyToken, auth.hasExecutiveManagerPrivileges, async (req, res) => {
  try {
    const storyToBeEdited = await Story.findById(req.body.storyid, (err, storyToBeEdited) => {
      if (err) {
        console.log(err);
      } else {
        // DEBUG
        console.log(storyToBeEdited);
      }
    });
    if (!storyToBeEdited) {
      return res.status(404).json({ message: "没有找到帖子。" });
    }
    storyToBeEdited.isPinned = req.body.isPinned;
    await storyToBeEdited.save().then(() => res.status(200).json({ story: storyToBeEdited, message: `_id为${req.body.storyid}的帖子的置顶状态已被修改为${req.body.isPinned}。` }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 修改指定帖子回复功能开启状态-需要常务管理员以上的权限
// 请求体形如：{ storyid: *story的_id*, canBeReplied: *true/false* }
// 返回体形如：{ message: `_id为${req.body.storyid}的帖子的回复功能开启状态已被修改为${req.body.canBeReplied}。` }
// 未找到帖子时返回404状态码和{ message: "没有找到帖子。" }
// 未知错误时返回400状态码和{ message: *错误信息* }
// PATCH /api/story/reply-feature-enabled-state
router.patch("/reply-feature-enabled-state", auth.verifyToken, auth.hasExecutiveManagerPrivileges, async (req, res) => {
  try {
    const storyToBeEdited = await Story.findById(req.body.storyid, (err, storyToBeEdited) => {
      if (err) {
        console.log(err);
      } else {
        // DEBUG
        console.log(storyToBeEdited);
      }
    });
    if (!storyToBeEdited) {
      return res.status(404).json({ message: "没有找到帖子。" });
    }
    storyToBeEdited.canBeReplied = req.body.canBeReplied;
    await storyToBeEdited.save().then(() => res.status(200).json({ message: `_id为${req.body.storyid}的帖子的回复功能开启状态已被修改为${req.body.canBeReplied}。` }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
