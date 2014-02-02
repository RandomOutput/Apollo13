package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class Post(timecode: Long, speaker: String, body: String)

object Post {
	val post = {
		get[Long]("timecode") ~
		get[String]("speaker") ~
		get[String]("posting") map { 
			case timecode~speaker~posting => Post(timecode, speaker, posting) 
		}
	}

	def all(): List[Post] = DB.withConnection { implicit c =>
		SQL("select * from transcript").as(post *)
	}

	def between(start: Long, end: Long): List[Post] = DB.withConnection { implicit c =>
		SQL("SELECT * FROM transcript WHERE timecode >= " + start + " AND timecode < " + end).as(post *)
	}
}