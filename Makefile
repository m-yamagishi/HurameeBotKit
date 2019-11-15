doc:
	mkdocs serve

doc-build:
	mkdocs build

doc-deploy:
	mkdocs gh-deploy

jar:
	java -jar ./huramee/target/huramee-0.0.1-SNAPSHOT.jar