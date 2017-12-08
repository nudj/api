source /root/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh

PROMPT='api» '

export PATH=/usr/src/node_modules/.bin:$PATH

alias ll="ls -la"
alias run='nodemon \
	--config ./nodemon.json \
	-e js,html,css \
	--quiet \
	--watch ./ \
	--delay 250ms \
	-x "node mock/run.js"'
alias dev='nodemon \
	--config ./nodemon.json \
	-e js,html,css \
	--quiet \
	--watch ./ \
	--delay 250ms \
	-x "node ."'

function test {
	export ENVIRONMENT=test
	standard && mocha --recursive test
	export ENVIRONMENT=local
}
function tdd {
	export ENVIRONMENT=test
	nodemon \
		--quiet \
		--watch ./ \
		--delay 250ms \
		-x "mocha --recursive test || exit 1"
	export ENVIRONMENT=local
}

# changes hex 0x15 to delete everything to the left of the cursor,
# rather than the whole line
bindkey "^U" backward-kill-line

# binds hex 0x18 0x7f with deleting everything to the left of the cursor
bindkey "^X\\x7f" backward-kill-line

# adds redo
bindkey "^X^_" redo

# history substring search
zle -N history-substring-search-up
zle -N history-substring-search-down
bindkey "^[OA" history-substring-search-up
bindkey "^[OB" history-substring-search-down

source /root/.zsh/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
source /root/.zsh/zsh-history-substring-search/zsh-history-substring-search.zsh
