package com.myamagishi.huramee;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class HurameeController {

	@RequestMapping(path = "/huramee")
	public String huramee(Model model) {
		model.addAttribute("msg", "サンプルメッセージ!");
		return "huramee/index";
	}

	@RequestMapping(path = "/test")
	public String test(Model model) {
		model.addAttribute("msg", "サンプルメッセージ!");
		return "test/test";
	}
}
