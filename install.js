const download = require('download-file')
const fs = require('fs');
const child_process = require('child_process')
const unzipper = require('unzipper')

function getPlatform() {
    var platform = process.platform;

    if (platform == 'darwin') {
        return 'darwin';
    } else if (platform == 'linux') {
        return 'debian'
    } else { 
        console.error(`platform ${platform} not supported .. exiting`)
        process.exit()
    }
}

function downloadFile(url, options, callback) {
    return new Promise((resolve, reject) => {
        download(url, options, function(err) {
            if (err) {
                reject(err);
                throw err;
            }
            callback(err);
            resolve("done");
        })
    });
}

function readFileSync(file, options, callback) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, options, function(err, data) {
                if (err) {
                    reject(err)
                    throw err;
                }
                resolve(data)
        })
    })
}

async function main() {
    var homedir = require('os').homedir()
    diggerdir=`${homedir}/.digger`
    child_process.execSync(`mkdir -p ${diggerdir}`)
    platform=getPlatform()
    await downloadFile('http://digger-releases.s3-eu-west-1.amazonaws.com/STABLE-VERSION', {path: '.'}, function(err) {})

    var tag = await readFileSync("STABLE-VERSION", "utf8")
    tag = tag.trim();
    // const tag = await fs.readFileSync("STABLE-VERSION", "utf8").trim();
    var versionUrl = 'http://digger-releases.s3-eu-west-1.amazonaws.com/STABLE-VERSION'
    var destination=`${diggerdir}/dg${tag}`
    var executable=`${destination}/dg/dg`
    var symlink="/usr/local/bin/dg"
    var filename=`dg-${platform}-${tag}.zip`
    var url=`http://digger-releases.s3-eu-west-1.amazonaws.com/${platform}/${filename}`

    console.log(tag)

    var options = {
        directory: "./",
        filename: filename
    }


    console.log("removing old installations")
    child_process.execSync(`rm -rf ${destination}`)
    child_process.execSync(`rm -rf ${symlink}`)

    console.log(`Downloading latest stable version of dg (${tag})`)
    await downloadFile(url, options, function(err){
        if (err) throw err;
    });

    console.log("extrating zip file")
    // unzip -q $filename -d $destination
    // chmod +x $executable
    await fs.createReadStream(filename)
        .pipe(unzipper.Extract({path: destination}))
        .on('close', function() {
            child_process.execSync(`chmod +x ${executable}`)
            // console.log("creating symlink")
            fs.symlinkSync(executable, symlink)        
        })
    
}

main()
