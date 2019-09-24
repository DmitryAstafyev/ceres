require 'fileutils'

USERS_OF_PLATFORM = [
    "client/consumer/src",
    "server/provider/src"
]
USERS_OF_PROTOCOLS = [
    "client/consumer/src",
    "server/provider/src",
    "server/transports/http.longpoll/src",
    "server/transports/ws/src",
    "client/transports/http.longpoll/src",
    "client/transports/ws/src"
]

SRC_OF_PLATFROM = "common/platform"
SRC_OF_PROTOCOLS = "common/protocols"

SRC_PROTOCOLS = [
    "common/protocols/connection/src/protocol.connection.json",
    "common/protocols/transports/ws/src/protocol.transport.ws.json",
    "common/protocols/transports/httt.longpoll/src/protocol.transport.longpoll.json",
    "playground/protocol/src/protocol.playground.json"
]

DEST_PROTOCOLS = [
    "common/protocols/connection/protocol.connection.ts",
    "common/protocols/transports/ws/protocol.transport.ws.ts",
    "common/protocols/transports/httt.longpoll/protocol.transport.longpoll.ts",
    "playground/protocol/protocol.playground.ts"
]

desc "Delivery common parts into components"
task :delivery do
  i = 0;
  while i < USERS_OF_PLATFORM.length
    path = USERS_OF_PLATFORM[i] + "/platform"
    puts "Check / create folder: #{path}"
    FileUtils.rm_r(path) unless !File.exists?(path)
    FileUtils.cp_r(SRC_OF_PLATFROM, path)
    i += 1
  end
  i = 0;
  while i < USERS_OF_PROTOCOLS.length
    path = USERS_OF_PROTOCOLS[i] + "/protocols"
    puts "Check / create folder: #{path}"
    FileUtils.rm_r(path) unless !File.exists?(path)
    FileUtils.cp_r(SRC_OF_PROTOCOLS, path)
    i += 1
  end
end

desc "Generate protocols"
task :protocols do 
    cd "." do
        sh "npm install"
    end
    i = 0;
    while i < SRC_PROTOCOLS.length
      src = SRC_PROTOCOLS[i]
      dest = DEST_PROTOCOLS[i]
      puts "Generate protocol: #{src}"
      cd "." do
        sh "./node_modules/.bin/ceres.protocol -s " + src + " -o " + dest + " -r"
      end
      i += 1
    end
end

desc "Building"
task :build do
    i = 0;
    while i < USERS_OF_PROTOCOLS.length
      path = USERS_OF_PROTOCOLS[i]
      puts "Building: #{path}"
      cd path do
        sh "npm run build-ts"
      end
      i += 1
    end
end


desc "Installation of all components"
task :install do
    cd "." do
        sh "npm install"
    end
    npm_install = [
        "client/consumer",
        "server/provider",
        "server/transports/http.longpoll",
        "server/transports/ws",
        "client/transports/http.longpoll",
        "client/transports/ws"
    ]
    i = 0;
    while i < npm_install.length
      path = npm_install[i]
      puts "Installing: #{path}"
      cd path do
        sh "npm install"
      end
      i += 1
    end

    Rake::Task["protocols"].invoke
    Rake::Task["delivery"].invoke
    Rake::Task["build"].invoke

end