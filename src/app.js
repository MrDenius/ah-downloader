const axios = require("axios").default;
const cli = require("cli");
const { config } = require("dotenv");
const fs = require("fs");
const path = require("path");
const term = require("terminal-kit").terminal;
const { JSDOM } = require("jsdom");

config();

const H_NAME = "lilith_s_code";
const H_URL = `http://wwv.allhen.live/${H_NAME}/`;
const SAVE_FOLDER = path.join(__dirname, "saved");

///rm_h.init(.*)/g

const Main = () => {
	term(H_URL + "\n");

	ParseTitle(H_URL).then(console.log);

	return;
	if (fs.existsSync(SAVE_FOLDER))
		fs.rmdirSync(SAVE_FOLDER, { recursive: true });
	GetPicturesData().then((pics) => {
		let i = 0;
		const StartDownload = () => {
			let index = String(i + 1);
			while (index.length < 3) index = "0" + index;
			DownloadImage(
				pics[i].url,
				path.join(SAVE_FOLDER, `${index}.jpg`)
			).then(() => {
				i++;
				if (i < pics.length) StartDownload();
			}); //XXX: Можно забахать асинхронность
		};
		term.getCursorLocation((x, y) => {
			term.clear();
			// for (let i = 0; i < pics.length; i++) {
			// 	let index = String(i + 1);
			// 	while (index.length < 3) index = "0" + index;
			// 	term.white.bold(`${index}.jpg\n`);
			// }
			// term.moveTo(x, y);
			StartDownload();
		});
	});
};

const ParseTitle = (url) => {
	return new Promise((resolve, reject) => {
		axios.get(url).then((res) => {
			const dom = new JSDOM(res.data);
			const document = dom.window.document;
			url = new URL(url);

			const surl = new URL(
				url.protocol +
					url.hostname +
					document.querySelector(
						"a.chapter-link.btn.btn-outline-primary.btn-lg.btn-block.read-first-chapter"
					).href
			).href;
			const info = document.querySelector("div.subject-meta");
			const toms = info
				.querySelectorAll("p")[0]
				.textContent.replace(/\n| |Томов:|Перевод:/g, "");
			const translate = info
				.querySelectorAll("p")[1]
				.textContent.replace(/\n| |Томов:|Перевод:/g, "");
			const genres = [...info.querySelectorAll(".elem_genre ")].map(
				(e) => e.querySelector("a").textContent
			);
			const authors = [...info.querySelectorAll(".elem_author ")].map(
				(e) => e.querySelector("a").textContent
			);
			const tags = [...info.querySelectorAll(".elem_tag ")].map(
				(e) => e.querySelector("a").textContent
			);
			const categorys = [...info.querySelectorAll(".elem_category ")].map(
				(e) => e.querySelector("a").textContent
			);
			const translators = [
				...info.querySelectorAll(".elem_translator "),
			].map((e) => e.querySelector("a").textContent);

			const title = {
				url: surl,
				toms,
				translate,
				genres,
				authors,
				tags,
				categorys,
				translators,
			};
			resolve(title);
		});
	});
};

const GetPicturesData = () => {
	return new Promise((resolve, reject) => {
		axios
			.get(H_URL)
			.then((res) => {
				const dom = new JSDOM(res.data);
				const document = dom.window.document;

				const urls = [
					...document
						.querySelector("select#chapterSelectorSelect")
						.querySelectorAll("option"),
				].map((e) => e.value);

				const GetUrl = (epi) => {
					return urls.find((url) => url.split("/")[3] == epi);
				};

				const ParsePics = (data) => {
					data = data
						.match(/rm_h.init(.*)/g)[0]
						.match(/\[.*\]/g)[0]
						.replace(/\'/g, '"');
					data = `[${data}]`;
					data = JSON.parse(data);

					let a = data[0];
					let b = data[1];

					for (b = 0; b < a.length; b++) {
						var e = a[b];
						a[b] = { url: "http:" + e[0] + e[2], w: e[3], h: e[4] };
					}

					return a;
				};

				const pics = ParsePics(res.data);

				const ExpandPics = () => {
					while (urls.length - pics.length <= 0) {
						if (!GetUrl(pics.length - 1)) return;
						//XXX: axios, parsePics, savePics
					}
				};

				ExpandPics();

				resolve(pics);
			})
			.catch(reject);
	});
};

const DownloadImage = (url, pathSave) => {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(path.dirname(pathSave)))
			fs.mkdirSync(path.dirname(pathSave));
		if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
		const writer = fs.createWriteStream(pathSave);

		axios({ url, method: "GET", responseType: "stream" }).then((res) => {
			const contentLength = res.headers["content-length"];
			let receivedLength = 0;
			const pb = term.progressBar({
				width: 80,
				title: path.basename(pathSave),
				eta: true,
				percent: true,
			});
			res.data.on("data", (chunk) => {
				receivedLength += chunk.length;
				pb.update(receivedLength / contentLength);
				writer.write(chunk);
			});
			res.data.on("end", () => {
				pb.update(1);
				pb.stop();
				term("\n");
				writer.end();
			});
			res.data.on("error", reject);
			writer.on("finish", resolve);
			writer.on("error", reject);
		});
	});
};

Main();
