package controllers

import play.api._
import play.api.mvc._
import models.Post
import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.libs.json._

object Application extends Controller {
  val speakerMap = Map("CDR" -> "Commander Jim Lovell","CMP" -> "CMP Jack Swigert","LMP" -> "LMP Fred Haise","CC" -> "Capcom");
  val eventMap = Map(
    "launch" -> 0,
    "lem_docking" -> 11800,
    "disaster" -> 201305,
    "thebox" -> 293559,
    "correction" -> 501062,
    "reentry" -> 513050);

  def index = Action {
    Redirect(routes.Application.stream)
  }

  def stream = Action {
  	val currentMissionTime = controllers.Helpers.getMissionTimestamp(Global.mission_start)
    val posts = Post.between(0,currentMissionTime).reverse

  	Ok(views.html.disaster(speakersToNames(posts), currentMissionTime))
  }

  def speakersToNames(posts: List[Post]) = {
    def name(post:Post) = { Post(post.timecode, speakerMap(post.speaker), post.body); }
    posts.map(post => name(post));
  }

  def postToJson(post: Post) = {
  	Map("timecode" -> Json.toJson(post.timecode),
  		"speaker" -> Json.toJson(post.speaker),
  		"body" -> Json.toJson(post.body)
  		)
  }

  def streamBetween(start: Long, end:Long) = Action {
  	val posts = Post.between(start,end)
    val namedPosts = speakersToNames(posts);
  	val jsonPosts = namedPosts.map(post => postToJson(post))
  	Ok(Json.toJson(jsonPosts))
  }

  def event(event:String) = Action {
    val posts = Post.between(0,eventMap(event)).reverse
    Ok(views.html.disaster(speakersToNames(posts), eventMap(event)))
  }

  def about = TODO

  def post(timecode: Long) = TODO

  def startMission = Action {
  	val timestamp: Long = System.currentTimeMillis / 1000

  	Global.mission_start = timestamp

  	Redirect(routes.Application.stream)
  }

}