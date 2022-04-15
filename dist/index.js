"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
// import puppeteer from 'puppeteer';
const fs_1 = __importDefault(require("fs"));
// import mongoose from 'mongoose';
const sqlite3 = __importStar(require("sqlite3"));
const IO_1 = require("./common/utils/IO");
const console_1 = __importDefault(require("console"));
// mongoose.connect('mongodb://localhost:27017/music');
const wait = async (time) => new Promise((res, rej) => setTimeout(() => res(true), time));
const pressTab = async (page, num) => {
    for (let i = 0; i < num; i++) {
        await page.keyboard.press("Tab");
        await wait(100);
    }
};
const addToRecrawl = async (db, songId, songName, singerName, error) => {
    var query = "INSERT into Failure(id, title, singer) VALUES(" + songId + ",'" + songName + "','" + singerName + "')";
    await db.serialize(() => {
        db.run(query, (err) => {
            if (err) {
                console_1.default.log('Could not insert to Failure', err);
            }
            else {
                console_1.default.log(songId + ': ' + error);
            }
        });
    });
    await wait(200);
};
const addToLyricData = async (db, songId, obj) => {
    var query = "INSERT into Success(id, title, singer, author, album, category, lyric) VALUES("
        + songId + ",'"
        + obj.title + "','"
        + obj.singer + "','"
        + obj.author + "','"
        + obj.album + "','"
        + obj.category + "','"
        + obj.lyric + "')";
    await db.serialize(() => {
        db.run(query, (err) => {
            if (err) {
                console_1.default.log('Could not insert to Success', err);
            }
            else {
                console_1.default.log(songId + ': Lấy dữu liệu thành công');
            }
        });
    });
    await wait(200);
};
const checkSingerInLyric = async (str1, str2) => {
    const a = await (0, IO_1.stringToSlug)(str1).split("-");
    const b = await (0, IO_1.stringToSlug)(str2).split("-");
    var flag = false;
    for (let i = 0; i < b.length; i++) {
        if (!a.includes(b[i])) {
            flag = true;
            break;
        }
    }
    return flag;
};
const checkLyric = async (lyric) => {
    var text = ['ft.', 'bài hát :', 'bài hát:', 'ca sĩ:', 'ca sĩ :', 'ca sỹ:', 'ca sỹ :', 'ca khúc:', 'artist:', 'sáng tác:', 'trình bày:', 'album:', 'title:'];
    var result = lyric;
    text.map((item) => {
        if (result.toLowerCase().indexOf(item) !== -1) {
            var pos = 0;
            pos = result.indexOf("\n", result.toLowerCase().indexOf(item)) + 1;
            result = result.substring(pos, result.length);
        }
    });
    return result;
};
const type = async (page, type) => {
    await page.keyboard.type(type);
    await wait(100);
};
const submitForm = async (db, songId, na, si) => {
    puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
    const browser = await puppeteer_extra_1.default.launch({ headless: false });
    // const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    // page.setViewport({width: 1280, height: 800});
    await page.goto("https://zingmp3.vn/");
    await wait(500);
    const closeBtn = await page.$('button.zm-btn.zm-tooltip-btn.close-btn.is-hover-circle.button');
    await closeBtn.click();
    await wait(500);
    await page.type('input[type="text"]', na + ' - ' + si, { delay: 10 });
    await page.keyboard.press('Enter');
    await wait(500);
    const list = await page.$$("div.list-item.media-item.hide-right");
    var flag = false;
    for (let i = 0; i < list.length; i++) {
        const son = await list[i].$eval('span.item-title.title > span > span > span', sin => sin.textContent);
        const sin = await list[i].$eval('h3.is-one-line.is-truncate.subtitle', son => son.textContent);
        const resultOfCheckSinger = await checkSingerInLyric(sin, si);
        if (son === na && !resultOfCheckSinger) {
            flag = true;
            const img = await list[i].$('figure');
            await img.click();
            await page.waitForTimeout(1000);
            break;
        }
    }
    if (!flag) {
        await addToRecrawl(db, songId, na, si, 'Không tìm thấy bài hát');
        await wait(200);
        await browser.close();
    }
    else {
        const vipAccount = await page.$('div.vip-content');
        if (vipAccount) {
            await addToRecrawl(db, songId, na, si, 'Bài hát yêu cầu quyền VIP');
            await wait(200);
            await browser.close();
        }
    }
    const openBtnMore = await page.$('button.zm-btn.zm-tooltip-btn.btn-more.is-hover-circle.button');
    await openBtnMore.click();
    await wait(500);
    const hoverTitle = await page.$('a > div.title-wrapper > span.item-title.title > span > span > span');
    await hoverTitle.hover();
    await wait(500);
    const openBtnLyric = await page.$('i.icon.ic-16-Lyric');
    await openBtnLyric.click();
    await page.waitForTimeout(1000);
    const getDetail = await page.$eval('div.song-info-submenu', music => music.textContent);
    await wait(200);
    if (getDetail === null || getDetail === "") {
        await addToRecrawl(db, songId, na, si, 'Thiếu thông tin yêu cầu');
        await wait(200);
        await browser.close();
    }
    const title = await page.$eval('a > div.title-wrapper > span.item-title.title > span > span > span', title => title.textContent);
    await wait(200);
    var singer = '';
    var album = '';
    var author = '';
    var category = '';
    var checkSinger = getDetail.indexOf('Nghệ sĩ');
    var checkAlbum = getDetail.indexOf('Album');
    var checkAuthor = getDetail.indexOf('Sáng tác');
    var checkCategory = getDetail.indexOf('Thể loại');
    if (checkSinger !== -1) {
        if (checkAlbum === -1 && checkAuthor === -1 && checkCategory === -1)
            singer = getDetail.substring(7, getDetail.length);
        else if (checkAlbum === -1 && checkAuthor === -1)
            singer = getDetail.substring(7, getDetail.indexOf('Thể loại'));
        else if (checkAlbum === -1)
            singer = getDetail.substring(7, getDetail.indexOf('Sáng tác'));
        else
            singer = getDetail.substring(7, getDetail.indexOf('Album'));
    }
    if (checkAlbum !== -1) {
        if (checkAuthor === -1 && checkCategory === -1)
            album = getDetail.substring(getDetail.indexOf('Album') + 5, getDetail.length);
        else if (checkAuthor === -1)
            album = getDetail.substring(getDetail.indexOf('Album') + 5, getDetail.indexOf('Thể loại'));
        else
            album = getDetail.substring(getDetail.indexOf('Album') + 5, getDetail.indexOf('Sáng tác'));
    }
    if (checkAuthor !== -1) {
        if (checkCategory === -1)
            author = getDetail.substring(getDetail.indexOf('Sáng tác') + 8, getDetail.length);
        else
            author = getDetail.substring(getDetail.indexOf('Sáng tác') + 8, getDetail.indexOf('Thể loại'));
    }
    if (checkCategory !== 1) {
        category = getDetail.substring(getDetail.indexOf('Thể loại') + 8, getDetail.length);
    }
    const resultOfCheckSinger = await checkSingerInLyric(singer, si);
    await wait(200);
    if (resultOfCheckSinger) {
        await addToRecrawl(db, songId, na, si, 'Ca sĩ không đúng yêu cầu');
        await wait(500);
        await browser.close();
    }
    const checkLyricExist = await page.$('textarea');
    await wait(200);
    var lyric = '';
    if (checkLyricExist === null) {
        await addToRecrawl(db, songId, na, si, 'Chưa cập nhật Lyric bài hát');
        await wait(500);
        await browser.close();
    }
    else {
        lyric = await page.$eval('textarea', lyric => lyric.innerHTML);
        await wait(200);
        if (lyric === null || lyric === "") {
            await addToRecrawl(db, songId, na, si, 'Chưa cập nhật Lyric bài hát');
            await wait(500);
            await browser.close();
        }
    }
    const newLyric = {
        title: title,
        singer: singer,
        author: author,
        album: album,
        category: category,
        lyric: lyric,
    };
    await wait(500);
    if (checkLyricExist !== null) {
        await addToLyricData(db, songId, newLyric);
    }
    await wait(500);
    await browser.close();
};
(async () => {
    const db = new sqlite3.Database('src/database/music-db.db', (err) => {
        if (err) {
            console_1.default.log('Could not connect to database', err);
        }
        else {
            console_1.default.log('Connected to database');
        }
    });
    var pos = 0;
    fs_1.default.readFile('miss.txt', (err, data) => {
        pos = parseInt(data.toString()) || 0;
    });
    db.all("SELECT field1, field2, field3 FROM roomsong", async (err, rows) => {
        const length = rows.length;
        for (let i = pos; i < length; i++) {
            try {
                var songId = parseInt(rows[i]["field1"]);
                await submitForm(db, songId, rows[i]["field2"], rows[i]["field3"]);
                // await submitForm(db, 0, 'Bụi Phấn', 'Đan Trường');
                await wait(1000);
            }
            catch (_a) { }
            fs_1.default.writeFile('miss.txt', i.toString(), err => {
                if (err) {
                    console_1.default.error(err);
                    return;
                }
            });
        }
    });
})();
//# sourceMappingURL=index.js.map