package com.appsmith.server.dtos;

import com.appsmith.external.views.Views;
import com.fasterxml.jackson.annotation.JsonView;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OldParam {

    @JsonView(Views.Public.class)
    String key;

    @JsonView(Views.Public.class)
    String value;
}
