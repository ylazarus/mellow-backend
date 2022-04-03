const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const ObjectId = require("mongodb").ObjectId

async function query(filterBy) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection("board")
    console.log('query');
    var boards = await collection.find(criteria).toArray()
    // _sort(boards, filterBy.sortBy) // add back if relevant
    return boards
  } catch (err) {
    logger.error("cannot find boards", err)
    throw err
  }
}

async function getById(boardId) {
  try {
    console.log('getById');

    const collection = await dbService.getCollection("board")
    const board = collection.findOne({ _id: ObjectId(boardId) })
    return board
  } catch (err) {
    logger.error(`while finding board ${boardId}`, err)
    throw err
  }
}

async function remove(boardId) {
  try {
    const collection = await dbService.getCollection("board")
    await collection.deleteOne({ _id: ObjectId(boardId) })
    return boardId
  } catch (err) {
    logger.error(`cannot remove board ${boardId}`, err)
    throw err
  }
}

async function add(board) {
  try {
    const collection = await dbService.getCollection("board")
    const addedBoard = await collection.insertOne(board)
    board._id = addedBoard.insertedId
    return board
  } catch (err) {
    logger.error("cannot insert board", err)
    throw err
  }
}
async function update(board) {
  try {
    console.log("updating board")
    var id = ObjectId(board._id)
    console.log(id)
    delete board._id
    const collection = await dbService.getCollection("board")
    await collection.updateOne({ _id: id }, { $set: { ...board } })
    board._id = id
    return board
  } catch (err) {
    logger.error(`cannot update board ${boardId}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}

  if (filterBy.name) {
    criteria.name = { $regex: filterBy.name, $options: "i" }
  }

  // if (filterBy.inStock) {
  //   const inStock = filterBy.inStock === "true" ? true : false
  //   criteria.inStock = { $eq: inStock }
  // }

  // if (filterBy.labels && filterBy.labels.length) {
  //   criteria.labels = { $in: filterBy.labels } // can also use $all: to match all criteria
  // }

  return criteria
}

function _sort(filteredBoards, sortBy) {
  if (!sortBy) return
  if (sortBy === "time")
    filteredBoards = filteredBoards.sort(
      (t1, t2) => t1.createdAt - t2.createdAt
    )
  else if (filterBy.sortBy === "price")
    filteredBoards = filteredBoards.sort((t1, t2) => t1.price - t2.price)
  else if (filterBy.sortBy === "name")
    filteredBoards = filteredBoards.sort((t1, t2) => {
      return t1.name.toLowerCase() > t2.name.toLowerCase() ? 1 : -1
    })
}

module.exports = {
  remove,
  query,
  getById,
  add,
  update,
}
