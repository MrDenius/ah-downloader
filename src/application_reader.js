//# sourceMappingURL=application_reader.js.map
const rm_h = {};
const window = { rm_h };
window.rm_h.compress = {
	toggleInit: function () {
		var a = $(".toggle-compression-icon");
		a.show();
		if ($.cookie("disableCompression")) return a.addClass("text-muted"), !1;
		a.addClass("text-info");
		return !0;
	},
	toggle: function () {
		$.removeCookie("disableCompression", { path: "/" }) ||
			$.cookie("disableCompression", !0, { expires: 365, path: "/" });
		location.reload();
	},
	apply: function () {
		try {
			if (
				!window.is_a_show_time &&
				(log(
					"Using resized images check",
					rm_h.servers,
					window.matchMedia("screen and (max-width: 600px)").matches
				),
				window.matchMedia("screen and (max-width: 600px)").matches &&
					rm_h.compress.toggleInit())
			)
				for (var a = 0; a < rm_h.servers.length; a++) {
					var b = rm_h.servers[a];
					if (b.res) {
						for (var c = 0; c < rm_h.pics.length; c++) {
							var d = rm_h.pics[c];
							rm_h.compress.isOkForResize(d) &&
								-1 != d.url.indexOf(b.path) &&
								(d.url = d.url.replace("://", "://res"));
						}
						b.path = b.path.replace("://", "://res");
						log("using resized server", b);
					}
				}
		} catch (e) {
			try {
				log("resize servers", e);
			} catch (g) {}
		}
	},
	isOkForResize: function (a) {
		return 1500 < a.w && 1.2 < a.w / a.h ? !1 : 690 < a.w;
	},
};
window.rm_h.resize = {
	borderWidth: 1,
	type: "real",
	types: {
		real: {
			ico: "fa-arrows-alt",
			desc:
				"\u0440\u0435\u0430\u043b\u044c\u043d\u044b\u0439 \u0440\u0430\u0437\u043c\u0435\u0440",
			getNext: function () {
				return "width";
			},
		},
		width: {
			ico: "fa-arrows-h",
			desc:
				"\u043f\u043e-\u0448\u0438\u0440\u0438\u043d\u0435 \u043e\u043a\u043d\u0430",
			getNext: function () {
				return rm_h.reader.alternativeView ? "real" : "full";
			},
		},
		full: {
			ico: "fa-expand",
			desc:
				"\u043f\u043e \u0440\u0430\u0437\u043c\u0435\u0440\u0443 \u044d\u043a\u0440\u0430\u043d\u0430",
			getNext: function () {
				return "real";
			},
		},
	},
	resizeImg: function () {
		var a = rm_h.reader.getCurrentPictureSize(),
			b = a.height,
			a = a.width,
			c,
			d = 20;
		rm_h.resize.verySmallScreen()
			? ((d = 0), $("#fotocontext").css("margin", "0 -10px"))
			: $("#fotocontext").css("margin", "");
		log("resize type", rm_h.resize.type);
		if ("real" === rm_h.resize.type) c = 1;
		else {
			var e = rm_h.wWidth() - 2 * rm_h.resize.borderWidth - d;
			log("resize", rm_h.wWidth(), d, e);
			c = e / a;
			if ("full" === rm_h.resize.type && !rm_h.reader.alternativeView) {
				var g = rm_h.wHeight() - rm_h.resize.borderWidth;
				c = Math.min(g / b, c);
				0.4 > c && !rm_h.resize.verySmallScreen() && (c = 0.4);
			}
		}
		d = a * c + 2 * rm_h.resize.borderWidth + d;
		$("#mangaBox")
			.css("width", d + "px")
			.css("max-width", d + "px");
		rm_h.reader.setReaderPictureSize(a, b, c, e);
	},
	save: function (a) {
		rm_h.resize.type = a;
		$.cookie("resize_type", a, { expires: 365, path: "/" });
		var b = rm_h.resize.types[a],
			c = rm_h.resize.findNextType(),
			c =
				b.desc +
				". \u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u043d\u0430 " +
				rm_h.resize.types[c].desc;
		$(".resize").attr("title", c);
		$(".resize .fa")
			.removeClass("fa-arrows-alt fa-expand fa-arrows-h")
			.addClass(b.ico);
		"real" === a && rm_h.reader.scrollPageTop(!0);
		rm_h.resize.resizeImg();
	},
	init: function () {
		var a = $.cookie("resize_type");
		a || (a = rm_h.resize.verySmallScreen() ? "width" : "real");
		rm_h.resize.save(a);
		$(window).resize(function () {
			rm_h.resize.resizeImg();
		});
	},
	change: function () {
		var a = rm_h.resize.findNextType();
		rm_h.resize.save(a);
	},
	findNextType: function () {
		return rm_h.resize.types[rm_h.resize.type].getNext();
	},
	verySmallScreen: function () {
		return 700 > rm_h.wWidth();
	},
};
window.rm_h.book = {
	setSetting: function (a, b) {
		for (var c = 1; 8 >= c; c++) $("body").removeClass(b + "-" + c);
		$.cookie(b, a, { expires: 365, path: "/" });
		rm_h.book.setValue(b, a);
	},
	setValue: function (a, b) {
		$("body").addClass(a + "-" + b);
		$(".settings ." + a).removeClass("current");
		$(".settings ." + a + "-" + b).addClass("current");
	},
	restoreValue: function (a, b) {
		b = $.cookie(a) || b;
		rm_h.book.setValue(a, b);
	},
	prepareText: function () {
		$(".b-chapter .note").popover({
			html: !0,
			trigger: "hover",
			placement: "auto",
			content: function () {
				return $(this).children(".note-content").html();
			},
		});
	},
	prepareReader: function () {
		rm_h.isTouchDevice() &&
			$(".b-chapter").swipe({
				swipeLeft: function () {
					rm_h.reader.scrollOneScreen(!0);
				},
				swipeRight: function () {
					rm_h.reader.scrollOneScreen(!1);
				},
				threshold: 150,
			});
	},
	prepareComments: function (a) {
		a.each(function (a, c) {
			c = $(c);
			c.filter("img").length ||
				c.append(
					"<span class='p-control no-user-select'><span class='hide js-link' onclick='addParagraphBookmark(" +
						(a + 1) +
						")' title='\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u043a\u043b\u0430\u0434\u043a\u0443 \u043d\u0430 \u0430\u0431\u0437\u0430\u0446'><i class='fa fa-lgg text-info fa-bookmark'></i></span></span>"
				);
		});
	},
	initReader: function () {
		try {
			var a = rm_h.reader.getPageNumFromUrl(),
				b = $(".b-chapter").find(
					">p, >div:not(.section), >img, .section>div, .section>img, .section>p"
				);
			if (a && b.length >= a) {
				var c = $(b[a - 1]).offset().top;
				$("html, body").animate({ scrollTop: c }, 500);
			}
			rm_h.book.prepareText();
			rm_h.book.prepareReader();
			rm_h.book.prepareComments(b);
		} catch (d) {
			log("initReader", d);
		}
	},
};
rm_h.comments = {
	scrollDown: function () {
		$("#new-twitt-button").focus();
	},
	claim: function (a) {
		var b = window.location.href;
		0 <= b.indexOf("#") && (b = b.substring(0, b.indexOf("#")));
		b = b + "#comm_" + a + "&page=" + rm_h.cur;
		a = COMMENTS_CLAIM_URL + "?url=" + encodeURIComponent(b);
		log(a);
		rm_h.layout.initModalBox(null, a);
	},
	prepareTwitts: function () {
		if (window.current_user_id) {
			var a = $(".twitter .us_" + window.current_user_id);
			a.find(">.contr>.fa-caret-up").remove();
			a.find(">.contr>.fa-caret-down")
				.removeClass("fa-caret-down")
				.addClass("fa-trash-alt");
		}
		rm_h.reader.pagesNumber && rm_h.comments.updateTwitts();
		setTimeout(function () {
			rm_h.comments.focusOnTwitt();
		}, 100);
	},
	focusOnTwitt: function () {
		if (window.rm_h.reader.commentId) {
			var a = $("#" + window.rm_h.reader.commentId);
			a.length ? a.focus() : $("#twitts").focus();
		}
	},
	updateTwitts: function () {
		$(".twitter>div.cm").toggleClass("hide", !0);
		$(".twitter>div.cm_" + rm_h.cur).toggleClass("hide", !1);
	},
	showForm: function (a, b) {
		var c = $(a).attr("id");
		$(a).hide();
		a = b ? ".comm#comm_" + b + ">.mess" : "#new-twitt-ph";
		var d = $(a).next(".twitter-form");
		d.length
			? d.show()
			: ((d = $(".form-new-twitt-template").html()),
			  (c = $('<div class="twitter-form"/>')
					.data("parent-id", b)
					.data("button-id", c)
					.html(d)),
			  b &&
					(c
						.find(".panel-heading")
						.html(
							"\u041e\u0442\u0432\u0435\u0442\u0438\u0442\u044c \u043d\u0430 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439"
						),
					c
						.find(".save-button span")
						.html(
							"\u041e\u0442\u0432\u0435\u0442\u0438\u0442\u044c"
						)),
			  c.insertAfter(a),
			  (b = c.find("#twittMessage")),
			  rm_h.comments.initInput(b),
			  b.focus());
	},
	submitForm: function (a) {
		var b = $(a).parents(".twitter-form"),
			c = b.data("parent-id"),
			d = b.find("#twittMessage");
		log(a, b, d, c);
		d = d.val();
		if (!d || 1 > d.length) log("short message", d);
		else {
			var e = b.find(".btn-success");
			e.find(".fa").show();
			e.attr("disabled", "disabled");
			setTimeout(function () {
				e.find(".fa").hide();
				e.removeAttr("disabled");
			}, 5e3);
			$.ajax({
				url: COMMENTS_SAVE_URL,
				data: { message: d, parentId: c, page: rm_h.cur },
				success: function (b) {
					log("success", a);
					rm_h.comments.hideForm(
						!0,
						a,
						"\u0412\u0430\u0448 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d. \u0421\u043a\u043e\u0440\u043e \u043e\u043d \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f"
					);
				},
			});
		}
	},
	hideForm: function (a, b, c) {
		b = $(b).parents(".twitter-form");
		var d = b.data("button-id");
		log("hide!!", b, d);
		c &&
			$("<div class='alert alert-info'/>")
				.html(c)
				.insertAfter(b)
				.fadeOut(5e3);
		a ? b.remove() : b.hide();
		$("#" + d).show();
	},
	initInput: function (a) {
		a.each(function () {
			this.setAttribute(
				"style",
				"height:" + this.scrollHeight + "px;overflow-y:hidden;"
			);
			var a = $(this);
			a.attr("maxlength") &&
				(a.before(
					"<div class='small max-length-label' style='text-align: right; margin-top: -20px; margin-right:1px; margin-bottom: 4px'><span class='label label-info'></span></div>"
				),
				rm_h.comments.checkMaxLength(this));
		}).on("input", function () {
			this.style.height = "auto";
			this.style.height = this.scrollHeight + "px";
			rm_h.comments.checkMaxLength(this);
		});
	},
	checkMaxLength: function (a) {
		a = $(a);
		var b = a.prev(".max-length-label").find(".label"),
			c = parseInt(a.attr("maxlength")),
			d = a.val().length,
			d = c - d;
		b.text(d)
			.toggleClass("label-info", 10 <= d)
			.toggleClass("label-danger", 10 > d);
		0 > d && (a.val(a.val().slice(0, c)), b.text(0));
	},
};
window.rm_h.reader = {
	commentId: void 0,
	pagesNumber: 0,
	initPages: function () {
		rm_h.reader.goPage(rm_h.reader.getPageNumFromUrl());
	},
	getPageNumFromUrl: function () {
		rm_h.reader.commentId = rm_h.utils.getFragment("comm_");
		return +rm_h.utils.getFragment("page=", !0, 0);
	},
	goNext: function (a) {
		rm_h.reader.goPage(rm_h.cur + 1, a);
	},
	goPrev: function (a) {
		rm_h.reader.goPage(rm_h.cur - 1, a);
	},
	goPage: function (a, b) {
		a = 1 * a || 0;
		$(".mangaReloadPic").hide();
		$(".mangaProgress").show();
		if (rm_h.reader.changeControl(a))
			$(".mangaProgress").hide(), $(".mangaReloadPic").show();
		else {
			var c = rm_h.pics[a];
			c.c = !0;
			$(".page-selector").val(a);
			"replaceState" in history &&
				(0 < a
					? history.replaceState(null, null, "#page=" + a)
					: document.location.hash &&
					  history.replaceState(null, null, "#"));
			rm_h.preloadIndex = a + 1;
			var d = $("#mangaPicture"),
				c = rm_h.reader.buildPicture(c, a, !0);
			c.appendTo($("#fotocontext"));
			d.attr("id", "nextPicture");
			rm_h.resize.resizeImg();
			d.hide();
			c.show();
			d.remove();
			rm_h.reader.scrollPageTop(b);
			rm_h.comments.updateTwitts();
			rm_h.updateAds(c[0], a);
		}
	},
	buildPicture: function (a, b, c) {
		log(a, b);
		var d = a.url;
		return $("<img class='hide' data-page='" + b + "'/>")
			.on("load", function () {
				rm_h.reader.preloadImages();
				c && ($(".mangaProgress").hide(), $(".mangaReloadPic").show());
			})
			.click(function () {
				rm_h.reader.goNext();
			})
			.on("error", function (b) {
				var d = $(this).data("page");
				log("error on page", d, b);
				rm_h.reader.reloadWrongPicture(d);
				rm_h.onPictureError(a.url);
				rm_h.reader.preloadImages();
				c && ($(".mangaProgress").hide(), $(".mangaReloadPic").show());
			})
			.attr({
				src: d,
				rH: a.h,
				rW: a.w,
				id: "mangaPicture",
				pageNum: b,
				class: "manga-img_" + b,
			});
	},
	preloadImages: function () {
		if (
			!(
				rm_h.preloadIndex >= rm_h.pics.length ||
				rm_h.preloadIndex > rm_h.cur + rm_h.preloadDeep
			)
		)
			if (rm_h.pics[rm_h.preloadIndex].c)
				rm_h.preloadIndex++, rm_h.reader.preloadImages();
			else {
				var a = $("<img class='mg_nomark'/>").attr(
					"src",
					rm_h.pics[rm_h.preloadIndex].url
				);
				rm_h.pics[rm_h.preloadIndex++].c = !0;
				a.on("load", function () {
					rm_h.reader.preloadImages();
				}).on("error", function () {
					rm_h.reader.preloadImages();
				});
				$("#mangaBox").append(a);
			}
	},
	refreshPicture: function () {
		var a = rm_h.cur,
			b = rm_h.pics[a];
		b.count = void 0;
		b.loadingError = void 0;
		rm_h.reader.reloadWrongPicture(a);
	},
	reloadWrongPicture: function (a) {
		var b = rm_h.pics[a];
		void 0 === b.count && (b.count = 0);
		if (1 < b.count) b.loadingError = !0;
		else {
			b.count++;
			for (
				var c = b.url.indexOf("/", 10) + 1, d = 0;
				d < rm_h.servers.length;
				d++
			)
				if (0 <= b.url.indexOf(rm_h.servers[d].path)) {
					b.url = rm_h.servers[d + 1].path + b.url.substring(c);
					rm_h.reader.updateWrongPicture(a);
					break;
				}
		}
	},
	updateWrongPicture: function (a) {
		$("#mangaPicture").attr("pageNum") == a &&
			rm_h.reader.goPage(rm_h.cur, !0);
	},
	drawControls: function () {
		rm_h.reader.showHint();
		try {
			$(".pages-count").append(rm_h.reader.pagesNumber);
			$(".pages-count-title").attr(
				"title",
				"\u041d\u043e\u043c\u0435\u0440 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b, \u0412\u0441\u0435\u0433\u043e " +
					rm_h.reader.pagesNumber
			);
			for (
				var a = $(".page-selector"), b = 0;
				b < rm_h.reader.pagesNumber;
				b++
			)
				a.append("<option value='" + b + "'>" + (b + 1) + "</option>");
			$(".footerControl").append($(".topControl").clone());
		} catch (c) {}
	},
	changeControl: function (a) {
		if (
			a > rm_h.reader.pagesNumber ||
			-1 > a ||
			(a >= rm_h.reader.pagesNumber && !nextLink) ||
			(0 > a && !prevLink)
		)
			return !0;
		rm_h.cur = a;
		$("#mangaPicture").show();
		if (0 > a && prevLink)
			return (
				$(".prevChapLink").show(),
				$("#mangaPicture").hide(),
				rm_h.reader.disableButton(".prevButton", !0),
				!0
			);
		if (0 == a && !prevLink)
			return rm_h.reader.disableButton(".prevButton", !0), !1;
		a >= rm_h.reader.pagesNumber &&
			nextLink &&
			rm_h.goToChapter(nextChapterLink);
		if (a == rm_h.reader.pagesNumber - 1 && !nextLink)
			return rm_h.reader.disableButton(".nextButton", !0), !1;
		$(".nextChapLink, .prevChapLink").hide();
		rm_h.reader.disableButton(".prevButton, .nextButton", !1);
		return !1;
	},
	getCurrentPictureSize: function () {
		var a = $("#mangaPicture"),
			b = a.attr("rH");
		return { width: a.attr("rW"), height: b };
	},
	setReaderPictureSize: function (a, b, c, d) {
		$("#mangaPicture")
			.attr("width", a * c)
			.attr("height", b * c);
	},
	showHint: function () {
		var a = $.cookie("hideHint");
		(a && "false" != a) || $("#helpHint").show();
	},
	closeHint: function () {
		$.cookie("hideHint", !0, { expires: 365, path: "/" });
		$("#helpHint").hide();
	},
	disableButton: function (a, b) {
		b ? $(a).attr("disabled", "disabled") : $(a).removeAttr("disabled");
	},
	scrollPageTop: function (a) {
		if (!a && !rm_h.isFirstPage)
			if ("real" != rm_h.resize.type) {
				if ((a = $("#mangaPicture")[0]))
					(a = rm_h.findPosY(a)), window.scroll(0, a);
			} else window.scroll(0, 75);
		rm_h.isFirstPage = !1;
	},
	scrollOneScreen: function (a) {
		var b = $(window),
			c = b.scrollTop(),
			b = b.height();
		$("html, body").animate({ scrollTop: (a ? 1 : -1) * b + c }, 0);
	},
};
window.rm_h.reader_alternative = {
	drawControls: function () {
		$(".footerControl").append($(".topControl").clone());
		rm_h.reader.showHint();
	},
	initPages: function () {
		$("#mangaPicture").remove();
		var a = $("#fotocontext");
		$.each(rm_h.pics, function (b, c) {
			setTimeout(function () {
				var d = rm_h.reader.buildPicture(c, b, !1);
				a.append(d);
				a.append("<br/>");
				rm_h.resize.resizeImg();
			}, 150 * b);
		});
		setTimeout(function () {
			$(".mangaProgress").hide();
			$(".mangaReloadPic").show();
		}, 1e3);
	},
	goNext: function (a) {
		rm_h.reader.scrollOneScreen(!0);
	},
	goPrev: function (a) {
		rm_h.reader.scrollOneScreen(!1);
	},
	goPage: function (a, b) {},
	preloadImages: function () {},
	refreshPicture: function () {
		var a = rm_h.cur;
		$.each(rm_h.pics, function (b, c) {
			c.loadingError &&
				((c.count = void 0),
				(c.loadingError = void 0),
				rm_h.reader.reloadWrongPicture(a));
		});
	},
	updateWrongPicture: function (a) {
		var b = rm_h.pics[a].url;
		$("#mangaPicture.manga-img_" + a).attr("src", b);
	},
	getCurrentPictureSize: function () {
		var a = 0;
		$.each(rm_h.pics, function (b, c) {
			c.w > a && (a = c.w);
		});
		return { width: a, height: 0 };
	},
	setReaderPictureSize: function (a, b, c, d) {
		log("setReaderPictureSize", c, d);
		$.each(rm_h.pics, function (a, b) {
			var f = b.w;
			b = b.h;
			if (1 !== c) {
				var h = d / f,
					f = d;
				b *= h;
			}
			$("#mangaPicture.manga-img_" + a)
				.attr("width", f)
				.attr("height", b);
		});
	},
	alternativeView: !0,
};
window.rm_h = $.extend(
	{
		findPosY: function (a) {
			var b = 0;
			if (a.offsetParent)
				for (;;) {
					b += a.offsetTop;
					if (!a.offsetParent) break;
					a = a.offsetParent;
				}
			else a.y && (b += a.y);
			return b;
		},
		wHeight: function () {
			return $(window).height();
		},
		wWidth: function () {
			return $(window).width();
		},
		updateAds: function (a, b) {
			try {
				changePictureEvent(a, b);
			} catch (c) {}
		},
		isTouchDevice: function () {
			return (
				"ontouchstart" in window ||
				"onmsgesturechange" in window ||
				!!navigator.msMaxTouchPoints
			);
		},
		goToChapter: function (a) {
			location.href = a;
			return !1;
		},
		onPictureError: function (a) {
			!a || 0 == a.length || a.indexOf("empty.gif");
		},
		init: function (a, b, c, d) {
			for (b = 0; b < a.length; b++) {
				var e = a[b];
				a[b] = { url: e[0] + e[2], w: e[3], h: e[4] };
			}
			rm_h.pics = a;
			rm_h.servers = d;
			rm_h.compress.apply();
			rm_h.servers.push(rm_h.servers[0]);
			c &&
				(log("web init"),
				(rm_h.reader = $.extend(rm_h.reader, rm_h.reader_alternative)));
			rm_h.reader.pagesNumber = a.length;
			rm_h.reader.drawControls();
			rm_h.resize.init();
			rm_h.reader.initPages();
			$(document).keyup(function (a) {
				try {
					var b = a.target.tagName;
					if ("INPUT" == b || "TEXTAREA" == b || "SELECT" == b)
						return !1;
				} catch (c) {}
				switch (a.keyCode) {
					case 32:
						return rm_h.resize.change(), a.stopPropagation(), !1;
					case 37:
						return rm_h.reader.goPrev(), a.stopPropagation(), !1;
					case 39:
						return rm_h.reader.goNext(), a.stopPropagation(), !1;
				}
			});
		},
		pics: void 0,
		servers: void 0,
		cur: 0,
		length: 0,
		isFirstPage: !0,
		preloadIndex: 0,
		preloadDeep: 3,
	},
	window.rm_h
);

module.exports = window;
