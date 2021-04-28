const axios = require("axios").default;
const cli = require("cli");
const { config } = require("dotenv");
const fs = require("fs");
const path = require("path");
const term = require("terminal-kit").terminal;

config();

const H_NAME = "saeko_no_shitatari";
const H_URL = `http://wwv.allhen.live/${H_NAME}/vol1/1`;
const SAVE_FOLDER = path.join(__dirname, "saved");

///rm_h.init(.*)/g

const Main = () => {
	term(H_URL + "\n");
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

const GetPicturesData = () => {
	return new Promise((resolve, reject) => {
		axios
			.get(H_URL)
			.then((res) => {
				let data = res.data
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

				resolve(a);
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
