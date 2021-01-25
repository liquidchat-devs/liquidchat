import React from 'react';
import { formatBytes } from './SizeFormatter';
import { formatDuration2 } from './DateFormatter';

function toFormat(message, [diss, repl]) {
    const skip = diss.length;
    let result = [];
    let lastIndex = 0;

    while(message.slice(lastIndex).split(diss).length > 2) {
        let i1 = message.indexOf(diss, lastIndex);
        if(i1 !== lastIndex){
            result.push(message.slice(lastIndex, i1));
        }
        let i2 = message.indexOf(diss, i1 + skip);
        lastIndex = i2 + skip;
        
        result.push(`<${repl}>${message.slice(i1 + skip, i2)}</${repl}>`);
    }
    result.push(message.slice(lastIndex, message.length));

    return result.join("");
}

function getVideoDomains() {
    return [
    "https://youtube.com", "https://youtu.be",
    "https://www.youtube.com", "https://www.youtu.be"]
}

function getInviteDomains() {
    return ["http://nekonetwork.net/invite"]
}

function getYoutubeEmbedLink(link) {
    if(link.includes("youtu.be")) {
        const i = link.indexOf("youtu.be/");
        return "https://youtube.com/embed/watch?v=" + link.substring(i + "youtu.be/".length)
    } else {
        const i = link.indexOf("watch?v=");
        return "https://youtube.com/embed/" + link.substring(i + "watch?v=".length)
    }
}

function getImageExtensions() {
    return [".apng", ".bmp", ".gif", ".ico", ".cur", ".jpg", ".jpeg", ".jfif", ".pjpeg", ".png", ".svg", ".tif", ".tiff", ".webp"]
}

function toFormatLink(chat, message) {
    let imageResults = [];
    let videoResults = [];
    let inviteResults = [];
    let results = [];
    let lastIndex = 0;

    while(lastIndex < message.length) {
        var i = message.indexOf("http://", lastIndex)
        var i2 = message.indexOf("https://", lastIndex)
        if(i === -1 && i2 === -1) {
            results.push(message.substring(lastIndex))
            lastIndex = message.length
        } else {
            i = (i === -1 ? i2 : i)
            if(i !== lastIndex) {
                results.push(message.substring(lastIndex, i));
                lastIndex += i - lastIndex;
            }
            var link = message.includes(" ", i) ? message.substring(i, message.indexOf(" ", i)) : message.substring(i)

            const imageExtensions = getImageExtensions()
            var isImage = imageExtensions.filter((ext) => { return link.endsWith(ext) }).length > 0
            if(isImage) {
                imageResults.push(link)
            }

            const videoDomains = getVideoDomains()
            var isVideo = videoDomains.filter((dom) => { return link.startsWith(dom) }).length > 0
            if(isVideo) {
                videoResults.push(link)
            }

            const inviteDomains = getInviteDomains()
            var isInvite = inviteDomains.filter((dom) => { return link.startsWith(dom) }).length > 0
            if(isInvite) {
                inviteResults.push(link)
            }

            results.push(`<a class="link" href="${link}" target="_blank">${link}</a>`)
            lastIndex += link.length
        }
    }

    if(imageResults.length > 0) { results.unshift(`<div class="displaygrid">`) }
    imageResults.forEach(link => {
        results.push(`
            <img alt="" class="message-image" src=${link}>
        `)
    })
    if(imageResults.length > 0) { results.push(`</div>`) }

    videoResults.forEach(link => {
        results.push(`<br/>
        <div class="video-player-wrapper chatColor">
            <a class="link video-text" href="${link}" target="_blank">
                some really cool video
            </a>
            <br/>
            <iframe class="video-player" src=${getYoutubeEmbedLink(link)}/>
        </div>`)
    })

    return results.join("");
}

function formatFile(chat, file) {
    const imageExtensions = getImageExtensions()
    var isImage = imageExtensions.filter((ext) => { return file.name.endsWith(ext) }).length > 0
    if(isImage) {
        return <span><img alt="" className="message-image" src={chat.props.state.fileEndpoint + "/" + file.name} onClick={(e) => { chat.props.setSelectedImage(file); chat.props.switchDialogState(8); }}/></span>
    }
    
    var extension = file.name.substring(file.name.lastIndexOf("."))
    var mimeType = -1
    switch(extension) {
        case ".mp4":
        case ".webm":
            mimeType = "video/" + extension.substring(1);
            break;

        case ".mp3":
            mimeType =  "audio/mpeg";
            break;

        case ".m4a":
            mimeType = "audio/x-m4a";
            break;

        case ".wav":
        case ".ogg":
            mimeType = "audio/" + extension.substring(1);
            break;

        default:
            mimeType = -1
            break;
    }

    if(mimeType !== -1) {
        if(mimeType.startsWith("video/")) {
            return <div className="flex"
                    onMouseEnter={() => {
                        let overlay = chat.refs["videoOverlay-" + file.name];
                        overlay.classList.remove("fadeOut"); if(!overlay.classList.contains("stopped")) { overlay.classList.add("fadeIn"); } 
                    }}
                    onMouseLeave={() => {
                        let overlay = chat.refs["videoOverlay-" + file.name];
                        overlay.classList.remove("fadeIn"); if(!overlay.classList.contains("stopped")) { overlay.classList.add("fadeOut"); } overlay.classList.remove("playing");
                    }}>
                <video width="420" height="240" ref={"video-" + file.name} className="video"
                    onCanPlay={() => {
                        let video = chat.refs["video-" + file.name];
                        let progress = chat.refs["progress-" + file.name];
                        let text = chat.refs["progressText-" + file.name];

                        progress.style.width = Math.floor((video.currentTime / video.duration) * 100) + "%"; 
                        text.innerHTML = formatDuration2(Math.floor(video.currentTime) * 1000) + "/" + formatDuration2(Math.floor(video.duration) * 1000);
                    }}
                    onTimeUpdate={() => {
                        chat.refs["progress-" + file.name].style.width = Math.floor((chat.refs["video-" + file.name].currentTime / chat.refs["video-" + file.name].duration) * 100) + "%"; 
                        chat.refs["progressText-" + file.name].innerHTML = formatDuration2(Math.floor(chat.refs["video-" + file.name].currentTime) * 1000) + "/" + formatDuration2(Math.floor(chat.refs["video-" + file.name].duration) * 1000);
                    }}
                    onVolumeChange={() => {
                        chat.refs["volume-" + file.name].style.width = Math.floor(chat.refs["video-" + file.name].volume * 100) + "%";
                    }}
                    onClick={() => {
                        chat.videoAction(chat.refs["video-" + file.name], file, "playpause");
                    }}
                    onEnded={() => {
                        chat.videoAction(chat.refs["video-" + file.name], file, "pause");
                    }}>
                    <source src={chat.props.state.fileEndpoint + "/" + file.name} type={mimeType}/>
                </video>
                <div className="opacity0 stopped" ref={"videoOverlay-" + file.name} style={{ width: 0 }}>
                    <div className="video-overlay white marginleft2 margintop1" style={{ width: 420, position: "relative" }}>
                        {file.name}
                        <br/>
                        <div className="tipColor">({formatBytes(file.size, true)})</div>
                    </div>
                    <div className="videoControls aligny">
                        <div className="button button1 marginleft2 videoButton" ref={"playButtonWrapper-" + file.name} onClick={() => { chat.videoAction(chat.refs["video-" + file.name], file, "playpause"); }}>
                            <svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></polygon></svg>
                        </div>
                        <div className="tipColor marginleft1" ref={"progressText-" + file.name} style={{ fontSize: 13, width: 100 }}>0:00</div>
                        <div className="progressWrapper marginleft2"
                            onClick={(e) => {
                                var pos = (e.pageX  - (e.currentTarget.offsetLeft + e.currentTarget.offsetParent.offsetLeft)) / e.currentTarget.offsetWidth;
                                chat.refs["video-" + file.name].currentTime = pos * chat.refs["video-" + file.name].duration;
                            }}>
                            <div className="progress" ref={"progress-" + file.name} />
                        </div>
                        <div className="button button1 marginleft2 videoButton"
                            onMouseEnter={() => {
                                let wrapper = chat.refs["volumeWrapper-" + file.name];
                                clearTimeout(wrapper.lastTimeout);
                                wrapper.style.opacity = 1; wrapper.style.pointerEvents = "all";
                            }}
                            onMouseLeave={() => {
                                let wrapper = chat.refs["volumeWrapper-" + file.name];
                                wrapper.lastTimeout = setTimeout(() => {
                                    if(wrapper.isBarHovered === false) { wrapper.style.opacity = 0; wrapper.style.pointerEvents = "none"; }
                                }, 1000);
                            }}>
                            <svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z"></path></svg>
                        </div>
                        <div className="button button1 marginleft2 videoButton" onClick={() => { chat.videoAction(chat.refs["video-" + file.name], file, "fullscreen"); }}>
                            <svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24" style={{ marginLeft: 0 }}><path fill="currentColor" d="M19,3H14V5h5v5h2V5A2,2,0,0,0,19,3Z"></path><path fill="currentColor" d="M19,19H14v2h5a2,2,0,0,0,2-2V14H19Z"></path><path fill="currentColor" d="M3,5v5H5V5h5V3H5A2,2,0,0,0,3,5Z"></path><path fill="currentColor" d="M5,14H3v5a2,2,0,0,0,2,2h5V19H5Z"></path></svg>
                        </div>
                        <div className="progressWrapper marginleft2 volumeWrapper" ref={"volumeWrapper-" + file.name}
                            onClick={(e) => {
                                var pos = (Math.floor(e.currentTarget.getBoundingClientRect().bottom) - e.pageY) / e.currentTarget.clientWidth;
                                chat.refs["video-" + file.name].volume = pos;
                                chat.refs["volume-" + file.name].style.width = Math.floor(chat.refs["video-" + file.name].volume * 100) + "%";
                            }}
                            onMouseEnter={() => { chat.refs["volumeWrapper-" + file.name].style.opacity = 1; chat.refs["volumeWrapper-" + file.name].style.pointerEvents = "all"; chat.refs["volumeWrapper-" + file.name].isBarHovered = true; }}
                            onMouseLeave={() => { chat.refs["volumeWrapper-" + file.name].style.opacity = 0; chat.refs["volumeWrapper-" + file.name].style.pointerEvents = "none"; chat.refs["volumeWrapper-" + file.name].isBarHovered = false; }}>
                            <div className="progress" ref={"volume-" + file.name}/>
                        </div>
                    </div>
                </div>
            </div>
        }

        return <div>
            <div className="audio-wrapper chatColor">
                <div className="link file-link" onClick={() => window.open(chat.props.state.fileEndpoint + "/" + file.name) }>{file.name}</div>
                <br/>
                <div className="tipColor">({formatBytes(file.size, true)})</div>
                <audio className="audio" ref={"audio-" + file.name}
                    onCanPlay={() => {
                        let audio = chat.refs["audio-" + file.name];
                        let progress = chat.refs["progress-" + file.name];
                        let text = chat.refs["progressText-" + file.name];

                        progress.style.width = Math.floor((audio.currentTime / audio.duration) * 100) + "%"; 
                        text.innerHTML = formatDuration2(Math.floor(audio.currentTime) * 1000) + "/" + formatDuration2(Math.floor(audio.duration) * 1000);
                    }}
                    onTimeUpdate={() => {
                        chat.refs["progress-" + file.name].style.width = Math.floor((chat.refs["audio-" + file.name].currentTime / chat.refs["audio-" + file.name].duration) * 100) + "%"; 
                        chat.refs["progressText-" + file.name].innerHTML = formatDuration2(Math.floor(chat.refs["audio-" + file.name].currentTime) * 1000) + "/" + formatDuration2(Math.floor(chat.refs["audio-" + file.name].duration) * 1000);
                    }}
                    onVolumeChange={() => {
                        chat.refs["volume-" + file.name].style.width = Math.floor(chat.refs["audio-" + file.name].volume * 100) + "%";
                    }}
                    onClick={() => {
                        chat.videoAction(chat.refs["audio-" + file.name], file, "playpause");
                    }}>
                    <source src={chat.props.state.fileEndpoint + "/" + file.name} type={mimeType}/>
                </audio>
                <div className="audioControls aligny margintop1">
                    <div className="button button1 marginleft2 videoButton" ref={"playButtonWrapper-" + file.name} onClick={() => { chat.videoAction(chat.refs["audio-" + file.name], file, "playpause"); }}>
                        <svg aria-hidden="false" width="22" height="22" viewBox="0 0 22 22"><polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></polygon></svg>
                    </div>
                    <div className="tipColor marginleft1" ref={"progressText-" + file.name} style={{ fontSize: 13, width: 100 }}>0:00</div>
                    <div className="progressWrapper marginleft2"
                        onClick={(e) => {
                            var pos = (e.pageX  - (e.currentTarget.offsetLeft + e.currentTarget.offsetParent.offsetLeft)) / e.currentTarget.offsetWidth;
                            chat.refs["audio-" + file.name].currentTime = pos * chat.refs["audio-" + file.name].duration;
                        }}>
                        <div className="progress" ref={"progress-" + file.name} />
                    </div>
                    <div className="button button1 marginleft2 videoButton"
                        onMouseEnter={() => {
                            let wrapper = chat.refs["volumeWrapper-" + file.name];
                            clearTimeout(wrapper.lastTimeout);
                            wrapper.style.opacity = 1; wrapper.style.pointerEvents = "all";
                        }}
                        onMouseLeave={() => {
                            let wrapper = chat.refs["volumeWrapper-" + file.name];
                            wrapper.lastTimeout = setTimeout(() => {
                                if(wrapper.isBarHovered === false) { wrapper.style.opacity = 0; wrapper.style.pointerEvents = "none"; }
                            }, 1000);
                        }}>
                        <svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z"></path></svg>
                    </div>
                    <div className="progressWrapper marginleft2 volumeWrapper" style={{ marginLeft: -85 }} ref={"volumeWrapper-" + file.name}
                        onClick={(e) => {
                            var pos = (Math.floor(e.currentTarget.getBoundingClientRect().bottom) - e.pageY) / e.currentTarget.clientWidth;
                            chat.refs["audio-" + file.name].volume = pos;
                            chat.refs["volume-" + file.name].style.width = Math.floor(chat.refs["audio-" + file.name].volume * 100) + "%";
                        }}
                        onMouseEnter={() => { chat.refs["volumeWrapper-" + file.name].style.opacity = 1; chat.refs["volumeWrapper-" + file.name].style.pointerEvents = "all"; chat.refs["volumeWrapper-" + file.name].isBarHovered = true; }}
                        onMouseLeave={() => { chat.refs["volumeWrapper-" + file.name].style.opacity = 0; chat.refs["volumeWrapper-" + file.name].style.pointerEvents = "none"; chat.refs["volumeWrapper-" + file.name].isBarHovered = false; }}>
                        <div className="progress" ref={"volume-" + file.name}/>
                    </div>
                </div>
            </div>
        </div>
    }

    return <div>
        <div className="file-wrapper chatColor">
            <div className="link file-link" onClick={() => window.open(chat.props.state.fileEndpoint + "/" + file.name) }>{file.name}</div>
            <br/>
            <div className="tipColor">({formatBytes(file.size, true)})</div>
        </div>
    </div>
}

function formatMessage(chat, message) {
    const styles = [
        ["**", "b"],
        ["*", "i"],
        ["__", "u"],
        ["~~", "s"],
        ["`", "code"]
    ];

    var messageFormatted = message.text
    var customMessage = false;
    
    if(messageFormatted.startsWith("http://nekonetwork.net/invite/")) {
        let id = messageFormatted.substring("http://nekonetwork.net/invite/".length)
        let invite = chat.props.API.API_fetchInviteSync(id);
        let author = invite === -1 ? undefined : chat.props.getUser(invite.author.id);
        let server = invite === -1 ? undefined : chat.props.getServer(invite.server.id);

        if(server !== undefined) {
            messageFormatted = (
            <div>
                <div className="invite-wrapper chatColor">
                    <p className="tooltipColor text9 margin0 marginleft2 marginbot0b">{author.username} invited you to a server-</p>
                    <div className="flex">
                        <img alt="" className="avatar4 marginleft2 margintop1a" src={chat.props.state.fileEndpoint + "/" + server.avatar}/>
                        <div>
                            <div className="white marginleft2 margintop1a">{server.name}</div>
                            <div className="tipColor marginleft2">{server.members.length} members</div>
                        </div>
                    </div>
                    <div className="button inviteButton marginleft2 margintop1b" style={server.members.includes(chat.props.state.session.userID) === false ? {} : {color: "#b3b3b3", border: "1px solid #b3b3b3", cursor: "default", position: "relative" }}
                    onClick={() => { if(server.members.includes(chat.props.state.session.userID) === false) { chat.props.API.API_joinServer(server.id); } }}>Join</div>
                </div>
            </div>)
            customMessage = true;
        }
    } else {
        styles.forEach((val, i) => {
            messageFormatted = toFormat(messageFormatted == null ? "" : messageFormatted, val);
        });
        messageFormatted = toFormatLink(chat, messageFormatted == null ? "" : messageFormatted);

        chat.props.state.emotes.forEach(e => {
            let link = chat.props.state.fileEndpoint + "/" + e.file;
            messageFormatted = messageFormatted.split("<:" + e.id + ":>").join(`<img class='emoteImage3' src=${link}>`)
        });
        chat.props.state.users.forEach(e => {
            messageFormatted = messageFormatted.split("<@" + e.id + ">").join(`<div class='white margin0 mention'>@${e.username}</div>`)
        });
    }

    return (
    <div>
        <div className="flex">
            {customMessage ?
                <div className="white margin0 flex prspace">
                    {messageFormatted}
                </div>
            :
                <p className="white margin0 flex prspace" dangerouslySetInnerHTML={{__html: messageFormatted}}></p>
            }
            {
            message.edited ? <p className="white margin0 text4 marginleft1"> (edited)</p> : ""
            }
        </div>
        {
        (message.file == null ? "" : formatFile(chat, message.file))
        }
    </div>
    );
}

export { formatMessage, toFormatLink, toFormat }