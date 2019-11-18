package com.myamagishi.huramee.entity;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface ProdDocumentDao extends ElasticsearchRepository<ProdDocument, String>{

}
