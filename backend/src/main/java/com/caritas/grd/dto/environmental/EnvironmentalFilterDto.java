package com.caritas.grd.dto.environmental;

import com.caritas.grd.model.InitiativeStatus;
import lombok.Data;

@Data
public class EnvironmentalFilterDto {

    private InitiativeStatus status;
    private String category;
    private Long districtId;
    private String search;
    private int page = 0;
    private int size = 10;
    private String sortBy = "createdAt";
    private String sortDir = "desc";
}
