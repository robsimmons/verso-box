ulimit -t 120

PROJECT="$(realpath "$1")"  # resolve symlinks                                                                                                                  
shift

LEAN_ROOT="$(cd $PROJECT && lean --print-prefix)"

mkdir -p _bwrap_out
rm -rf _bwrap_out/*

exec bwrap \
    --ro-bind /nix /nix \
    --ro-bind /run /run \
    --dev /dev \
    --tmpfs /tmp \
    --proc /propc \
    --ro-bind "$PROJECT" /project \
    --ro-bind "$LEAN_ROOT" /lean \
    --bind ./fiddlesticks /project/_out \
    --tmpfs /project/.lake/build \
    --tmpfs /tmp \
    --proc /proc \
    --clearenv	\
    --setenv PATH "/lean/bin:$(dirname $(which dirname)):$(dirname $(which git))" \
    --unshare-user \
    --unshare-pid  \
    --unshare-net  \
    --unshare-uts  \
    --unshare-cgroup \
    --die-with-parent \
    --chdir /project \
    /lean/bin/lake --old --keep-toolchain exe mkdoc
