package com.todo.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.todo.domain.UploadData;
import com.todo.repository.TodoRepository;
import com.todo.support.FileUploader;

@Controller
public class HomeController {

	private static final Logger log = LoggerFactory.getLogger(HomeController.class);

	@Autowired
	TodoRepository dbRepository;

	@RequestMapping("/")
	public @ResponseBody String boardForm() {
		return "Test Print";
	}

	@RequestMapping(value = "/upload", method = RequestMethod.OPTIONS)
	public void preflight() {
		log.debug("preFlight Request");
	}
	
	@RequestMapping(value = "/upload", method = RequestMethod.POST)
	public @ResponseBody String addFile(UploadData data, MultipartFile file) {
		log.debug("Upload Data : {}", data);

		// log.debug("board : "+ boardData);
		// 이렇게 구현될 경우 메서드 호출 전 전달인자를 먼저 처리하기 때문에
		// string비용발생이 생기게 된다. info 레벨이 더라도!! 그렇기 때문에 slf4j, logback에서 지원되고 있는 이
		// 기능을 사용하면,
		// 메서드에 전달인자를 그냥 전달하기 때문에 성능상에 이슈가 없다.

		//String uploadFileName = FileUploader.upload(file);
		//boardData.setFileName(uploadFileName);

		//Todo savedBoardData = dbRepository.save(boardData);

		//log.debug("savedBoardData : {}", savedBoardData.toString());

		//return "redirect:/board/" + savedBoardData.getId();
		
		return "test";
	}
}
