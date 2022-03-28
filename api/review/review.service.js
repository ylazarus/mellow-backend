const dbService = require("../../services/db.service")
const ObjectId = require("mongodb").ObjectId
const asyncLocalStorage = require("../../services/als.service")

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection("review")
    // const reviews = await collection.find(criteria).toArray()
    var reviews = await collection
      .aggregate([
        {
          $match: criteria,
        },
        {
          $lookup: {
            from: "user",
            foreignField: "_id",
            localField: "byUserId",
            as: "user",
          },
        },
        {
          $unwind: "$byUser", // [{}] => {}
        },
        {
          $lookup: {
            from: "toy",
            foreignField: "_id",
            localField: "toyId",
            as: "toy",
          },
        },
        {
          $unwind: "$aboutUser",
        },
      ])
      .toArray()
    console.log('after search', reviews)
    // reviews = reviews.map(review => {
    //     review.byUser = { _id: review.byUser._id, fullname: review.byUser.fullname }
    //     // review.aboutUser = { _id: review.aboutUser._id, fullname: review.aboutUser.fullname }
    //     delete review.byUserId
    //     // delete review.aboutUserId
    //     return review
    // })

    return reviews
  } catch (err) {
    logger.error("cannot find reviews", err)
    throw err
  }
}

async function remove(reviewId) {
  try {
    const store = asyncLocalStorage.getStore()
    const { userId, isAdmin } = store
    const collection = await dbService.getCollection("review")
    // remove only if user is owner/admin
    const criteria = { _id: ObjectId(reviewId) }
    if (!isAdmin) criteria.byUserId = ObjectId(userId)
    await collection.deleteOne(criteria)
  } catch (err) {
    logger.error(`cannot remove review ${reviewId}`, err)
    throw err
  }
}

async function add(review) {
  try {
    console.log("in review service")
    const reviewToAdd = {
      byUserId: ObjectId(review.byUserId),
      toyId: ObjectId(review.toyId),
      txt: review.txt,
    }
    const collection = await dbService.getCollection("review")
    await collection.insertOne(reviewToAdd)
    return reviewToAdd
  } catch (err) {
    logger.error("cannot insert review", err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  console.log(filterBy)
  const criteria = {}
  //   if (filterBy.byUserId) criteria.byUserId = filterBy.byUserId
  if (filterBy.toyId) {
    return { toyId: ObjectId(filterBy.toyId) }
  } else if (filterBy.userId) {
    return { userId: ObjectId(filterBy.userId) }
  }
  return {}
}
module.exports = {
  query,
  remove,
  add,
}
