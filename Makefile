doc:
	mkdocs serve

doc-build:
	mkdocs build

doc-deploy:
	mkdocs gh-deploy

jar:
	java -jar ./huramee/target/huramee-0.0.1-SNAPSHOT.jar

es-test:
	curl -X GET http://localhost:9200/
	curl -XGET http://localhost:9200/_aliases?pretty
	curl -XGET http://localhost:9200/fess.search/_mapping?pretty