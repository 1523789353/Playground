Usage: aria2c [OPTIONS] [URI | MAGNET | TORRENT_FILE | METALINK_FILE]...
Printing options tagged with '#basic'.
See 'aria2c -h#help' to know all available tags.
Options:
 -v, --version                打印版本号并退出.

                              Tags: #basic

 -h, --help[=TAG|KEYWORD]     打印用法并退出.
                              帮助信息以 tag 分类. tag 以 "#" 开头.
                              例如, 输入 "--help=#http" 以获取被标记为 "#http" 的 Option 的用法.
                              如果给出了非 tag 词，则打印名称中包含该单词的 Option 的用法。

                              可能的值: #basic, #advanced, #http, #https, #ftp, #metalink, #bittorrent, #cookie, #hook, #file, #rpc, #checksum, #experimental, #deprecated, #help, #all
                              默认: #basic
                              Tags: #basic, #help

 -l, --log=LOG                日志文件的路径. 如果指定的是 '-' , 则将日志写入到标准输出.

                              可能的值: /path/to/file, -
                              Tags: #basic

 -d, --dir=DIR                下载目录的路径.

                              可能的值: /path/to/directory
                              默认值: D:\Users\1523789353\Desktop\Aria2
                              Tags: #basic, #file

 -o, --out=FILE               下载文件路径. 相对于-d选项中给定的目录.
                              使用-Z选项时，将忽略此选项。

                              可能的值: /path/to/file
                              Tags: #basic, #http, #ftp, #file

 -s, --split=N                使用N个连接来下载文件. 如果给定的URI超过N个，则使用前N个URI下载, 其余URI备用.
                              如果给定的URI少于N个, 则将复用这些URL, 以便同时维护N个连接.
                              到同一主机的连接数受 --max-connection-per-server 选项的限制,
                              另请参见 --min-split-size 选项

                              可能的值: 1-*
                              默认: 5
                              Tags: #basic, #http, #ftp

 --file-allocation=METHOD     指定分配文件空间的方法.
                              'none' 不会预先分配文件空间.
                              'prealloc' 在下载开始之前预分配文件空间. 这可能需要一些时间, 具体取决于文件大小.
                              如果您使用的是较新的文件系统, 如ext4(支持扩展数据块)、btrfs、xfs或NTFS(仅适用于MinGW构建版本), 那么 "falloc" 是您的最佳选择.
                              If you are using newer file systems such as ext4
                              (with extents support), btrfs, xfs or NTFS
                              (MinGW build only), 'falloc' is your best
                              choice. It allocates large(few GiB) files
                              almost instantly. Don't use 'falloc' with legacy
                              file systems such as ext3 and FAT32 because it
                              takes almost same time as 'prealloc' and it
                              blocks aria2 entirely until allocation finishes.
                              'falloc' may not be available if your system
                              doesn't have posix_fallocate() function.
                              'trunc' uses ftruncate() system call or
                              platform-specific counterpart to truncate a file
                              to a specified length.

                              可能的值: none, prealloc, trunc, falloc
                              默认: prealloc
                              Tags: #basic, #file

 -V, --check-integrity[=true|false] Check file integrity by validating piece
                              hashes or a hash of entire file. This option has
                              effect only in BitTorrent, Metalink downloads
                              with checksums or HTTP(S)/FTP downloads with
                              --checksum option. If piece hashes are provided,
                              this option can detect damaged portions of a file
                              and re-download them. If a hash of entire file is
                              provided, hash check is only done when file has
                              been already download. This is determined by file
                              length. If hash check fails, file is
                              re-downloaded from scratch. If both piece hashes
                              and a hash of entire file are provided, only
                              piece hashes are used.

                              可能的值: true, false
                              Default: false
                              Tags: #basic, #metalink, #bittorrent, #file, #checksum

 -c, --continue[=true|false]  Continue downloading a partially downloaded
                              file. Use this option to resume a download
                              started by a web browser or another program
                              which downloads files sequentially from the
                              beginning. Currently this option is only
                              applicable to http(s)/ftp downloads.

                              可能的值: true, false
                              Default: false
                              Tags: #basic, #http, #ftp

 -i, --input-file=FILE        Downloads URIs found in FILE. You can specify
                              multiple URIs for a single entity: separate
                              URIs on a single line using the TAB character.
                              Reads input from stdin when '-' is specified.
                              Additionally, options can be specified after each
                              line of URI. This optional line must start with
                              one or more white spaces and have one option per
                              single line. See INPUT FILE section of man page
                              for details. See also --deferred-input option.

                              可能的值: /path/to/file, -
                              Tags: #basic

 -j, --max-concurrent-downloads=N Set maximum number of parallel downloads for
                              every static (HTTP/FTP) URL, torrent and metalink.
                              See also --split and --optimize-concurrent-downloads options.

                              可能的值: 1-*
                              Default: 5
                              Tags: #basic

 -Z, --force-sequential[=true|false] Fetch URIs in the command-line sequentially
                              and download each URI in a separate session, like
                              the usual command-line download utilities.

                              可能的值: true, false
                              Default: false
                              Tags: #basic

 -x, --max-connection-per-server=NUM The maximum number of connections to one
                              server for each download.

                              可能的值: 1-16
                              Default: 1
                              Tags: #basic, #http, #ftp

 -k, --min-split-size=SIZE    aria2 does not split less than 2*SIZE byte range.
                              For example, let's consider downloading 20MiB
                              file. If SIZE is 10M, aria2 can split file into 2
                              range [0-10MiB) and [10MiB-20MiB) and download it
                              using 2 sources(if --split >= 2, of course).
                              If SIZE is 15M, since 2*15M > 20MiB, aria2 does
                              not split file and download it using 1 source.
                              You can append K or M(1K = 1024, 1M = 1024K).

                              可能的值: 1048576-1073741824
                              Default: 20M
                              Tags: #basic, #http, #ftp

 --ftp-user=USER              Set FTP user. This affects all URLs.

                              Tags: #basic, #ftp

 --ftp-passwd=PASSWD          Set FTP password. This affects all URLs.

                              Tags: #basic, #ftp

 --http-user=USER             Set HTTP user. This affects all URLs.

                              Tags: #basic, #http

 --http-passwd=PASSWD         Set HTTP password. This affects all URLs.

                              Tags: #basic, #http

 --load-cookies=FILE          Load Cookies from FILE using the Firefox3 format
                              and Mozilla/Firefox(1.x/2.x)/Netscape format.

                              可能的值: /path/to/file
                              Tags: #basic, #http, #cookie

 -S, --show-files[=true|false] Print file listing of .torrent, .meta4 and
                              .metalink file and exit. More detailed
                              information will be listed in case of torrent
                              file.

                              可能的值: true, false
                              Default: false
                              Tags: #basic, #metalink, #bittorrent

 --max-overall-upload-limit=SPEED Set max overall upload speed in bytes/sec.
                              0 means unrestricted.
                              You can append K or M(1K = 1024, 1M = 1024K).
                              To limit the upload speed per torrent, use
                              --max-upload-limit option.

                              可能的值: 0-*
                              Default: 0
                              Tags: #basic, #bittorrent

 -u, --max-upload-limit=SPEED Set max upload speed per each torrent in
                              bytes/sec. 0 means unrestricted.
                              You can append K or M(1K = 1024, 1M = 1024K).
                              To limit the overall upload speed, use
                              --max-overall-upload-limit option.

                              可能的值: 0-*
                              Default: 0
                              Tags: #basic, #bittorrent

 -T, --torrent-file=TORRENT_FILE  The path to the .torrent file.

                              可能的值: /path/to/file
                              Tags: #basic, #bittorrent

 --listen-port=PORT...        Set TCP port number for BitTorrent downloads.
                              Multiple ports can be specified by using ',',
                              for example: "6881,6885". You can also use '-'
                              to specify a range: "6881-6999". ',' and '-' can
                              be used together.

                              可能的值: 1024-65535
                              Default: 6881-6999
                              Tags: #basic, #bittorrent

 --enable-dht[=true|false]    Enable IPv4 DHT functionality. It also enables
                              UDP tracker support. If a private flag is set
                              in a torrent, aria2 doesn't use DHT for that
                              download even if ``true`` is given.

                              可能的值: true, false
                              Default: true
                              Tags: #basic, #bittorrent

 --dht-listen-port=PORT...    Set UDP listening port used by DHT(IPv4, IPv6)
                              and UDP tracker. Multiple ports can be specified
                              by using ',', for example: "6881,6885". You can
                              also use '-' to specify a range: "6881-6999".
                              ',' and '-' can be used together.

                              可能的值: 1024-65535
                              Default: 6881-6999
                              Tags: #basic, #bittorrent

 --enable-dht6[=true|false]   Enable IPv6 DHT functionality.
                              Use --dht-listen-port option to specify port
                              number to listen on. See also --dht-listen-addr6
                              option.

                              可能的值: true, false
                              Default: false
                              Tags: #basic, #bittorrent

 --dht-listen-addr6=ADDR      Specify address to bind socket for IPv6 DHT. 
                              It should be a global unicast IPv6 address of the
                              host.

                              Tags: #basic, #bittorrent

 -M, --metalink-file=METALINK_FILE The file path to the .meta4 and .metalink
                              file. Reads input from stdin when '-' is
                              specified.

                              可能的值: /path/to/file, -
                              Tags: #basic, #metalink

URI, MAGNET, TORRENT_FILE, METALINK_FILE:
 You can specify multiple HTTP(S)/FTP URIs. Unless you specify -Z option, all
 URIs must point to the same file or downloading will fail.
 You can also specify arbitrary number of BitTorrent Magnet URIs, torrent/
 metalink files stored in a local drive. Please note that they are always
 treated as a separate download.

 You can specify both torrent file with -T option and URIs. By doing this,
 download a file from both torrent swarm and HTTP/FTP server at the same time,
 while the data from HTTP/FTP are uploaded to the torrent swarm. For single file
 torrents, URI can be a complete URI pointing to the resource or if URI ends
 with '/', 'name' in torrent file is added. For multi-file torrents, 'name' and
 'path' in torrent are added to form a URI for each file.

 Make sure that URI is quoted with single(') or double(") quotation if it
 contains "&" or any characters that have special meaning in shell.

About the number of connections
 Since 1.10.0 release, aria2 uses 1 connection per host by default and has 20MiB
 segment size restriction. So whatever value you specify using -s option, it
 uses 1 connection per host. To make it behave like 1.9.x, use
 --max-connection-per-server=4 --min-split-size=1M.

Refer to man page for more information.
