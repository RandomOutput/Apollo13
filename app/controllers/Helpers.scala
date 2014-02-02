package controllers

import play.api._
import play.api.mvc._

object Helpers extends Controller {
	def getMissionTimestamp(missionStart: Long): Long = {
		val timestamp: Long = System.currentTimeMillis / 1000
		timestamp - missionStart
	}
}