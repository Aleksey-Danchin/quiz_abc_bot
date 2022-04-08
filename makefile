up:
	docker-compose -f development.yml --env-file .env up

down:
	docker-compose -f development.yml --env-file .env down

build:
	docker-compose -f development.yml --env-file .env up --build