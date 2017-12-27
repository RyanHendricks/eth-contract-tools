build-contracts:
	$(shell pwd -P)/node_modules/sol-merger/bin/sol-merger.js $(shell pwd -P)/contracts/$(dir)/$(contract).sol $(shell pwd -P)/build/merged/$(contract)

graphpng:
	solgraph $(shell pwd -P)/contracts/$(dir)/$(contract).sol | dot -Tpng > $(shell pwd -P)/graphs/$(dir)/$(contract).png

graphrec:
	$(shell pwd -P)/node_modules/solidity-graph/index.js $(shell pwd -P)/contracts/$(directory) --output $(shell pwd -P)/build/temp/ -c
	cp $(shell pwd -P)/build/temp/graph.png $(shell pwd -P)/build/$(directory).png
	rm $(shell pwd -P)/build/temp/graph.png

treemap:
	tree --noreport -L 9 -X -I "$(exclude)" $(shell pwd -P)/contracts/ | sed 's/directory/node/g'| sed 's/name/TEXT/g' | sed 's/tree/map/g' | sed '$d' | sed '$d' | sed '$d'|  sed "1d" | sed 's/report/\/map/g' | sed 's/<map>/<map version="1.0.1">/g' > map.mm

treespec:
	tree -L 9 -X -I tmp $(shell pwd -P)/contracts/$(directory)/ | sed 's/directory/node/g'| sed 's/name/TEXT/g' | sed 's/tree/map/g' | sed '$d' | sed '$d' | sed '$d'|  sed "1d" | sed 's/report/\/map/g' | sed 's/<map>/<map version="1.0.1">/g' > $(shell pwd -P)/contracts/$(directory)/Map.mm

compile:
	solc --optimize --abi --bin --metadata $(shell pwd -P)/contracts/$(contract).sol > $ $(shell pwd -P)/build/$(contract).txt

#  "sol-merger './contracts/*.sol' ./build",

## STILL IN PROGRESS


flat:
	solidity_flattener $(shell pwd -P)/$(subdir)/$(contract).sol --out $(shell pwd -P)/flat/$(contract)_flat.sol

merged:
	$(shell pwd -P)/node_modules/sol-merger $(shell pwd -P)/contracts/*.sol 

graphdot:
	solgraph $(shell pwd -P)/contracts/$(dir)/$(contract).sol | > $(shell pwd -P)/build/$(dirs)/$(contract).dot
	# solgraph | dot -Tpng | open

solgraph:
	pbpaste | solgraph | dot -Tpng > $(shell pwd -P)


tree:
	tree -d -L 8 -X -I tmp $(shell pwd -P)/contracts/$(directory)/ | sed 's/directory/node/g'| sed 's/name/TEXT/g' | sed 's/tree/map/g' | sed '$d' | sed '$d' | sed '$d'|  sed "1d" | sed 's/report/\/map/g' | sed 's/<map>/<map version="1.0.1">/g' > $(shell pwd -P)/contracts/$(directory)/Map.mm

abi:
	solc zeppelin-solidity=$(shell pwd -P)/node_modules/zeppelin-solidity/ contracts/EthearnalRepTokenCrowdsale.sol --abi | grep ":EthearnalRepTokenCrowdsale " -A2 | tail -n1 > build/EthearnalRepTokenCrowdsale.abi

source:
	node_modules/sol-merger/bin/sol-merger.js "contracts/*.sol" var/build
	cp var/build/*.sol build

build: source abi

testrpc:
	node_modules/.bin/testrpc -p 8545 \
		--account="0x7e9a1de56cce758c544ba5dea3a6347a4a01c453d81edc32c2385e9767f29505, 1000000000000000000000000000" \
		--account="0xf2029a2f20a9f57cd1a9a2a44c63d0c875f906c646f333b028cb6f1c38ef7db5, 1000000000000000000000000000" \
		--account="0x84f24b0dddc8262675927168bbbf8688f846bcaedc2618ae576d34c043401719, 1000000000000000000000000000" \
		--account="0x1fdc76364db4a4bcfad8f2c010995a96fcb98a165e34858665a234ba5471520b, 1000000000000000000000000000" \
		--account="0x1fdc76364db4a4bcfad8f2c010995a96fcb98a165e34858665a234ba5471520c, 1000000000000000000000000000" \
		--account="0x1fdc76364db4a4bcfad8f2c010995a96fcb98a165e34858665a234ba54715123, 1000000000000000000000000000" \
		--account="0x1fdc76364db4a4bcfad8f2c010995a96fcb98a165e34858665a234ba54715104, 1000000000000000000000000000" \

test:
	truffle test
