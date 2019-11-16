package com.myamagishi.huramee.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;

import lombok.Getter;
import lombok.Setter;

@Document(indexName="${com.myamagishi.huramee.es.index}")
@Getter
@Setter
public class ProdDocument {
	@Id
	private String id;
}
