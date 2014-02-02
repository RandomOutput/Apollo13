package controllers

import play.api._
import play.api.mvc._
import models.Post
import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.libs.json._

object Application extends Controller {

  def index = Action {
    Redirect(routes.Application.stream)
  }

  def stream = Action {
  	val currentMissionTime = controllers.Helpers.getMissionTimestamp(Global.mission_start)
  	Ok(views.html.index(Post.between(0,currentMissionTime).reverse, currentMissionTime))
  }

  def postToJson(post: Post) = {
  	Map("timecode" -> Json.toJson(post.timecode),
  		"speaker" -> Json.toJson(post.speaker),
  		"body" -> Json.toJson(post.body)
  		)
  }

  def streamBetween(start: Long, end:Long) = Action {
  	val posts = Post.between(start,end)
  	val jsonPosts = posts.map(post => postToJson(post))
  	Ok(Json.toJson(jsonPosts))
  }

  def about = TODO

  def post(timecode: Long) = TODO

  def startMission = Action {
  	val timestamp: Long = System.currentTimeMillis / 1000

  	Global.mission_start = timestamp

  	Redirect(routes.Application.stream)
  }

}