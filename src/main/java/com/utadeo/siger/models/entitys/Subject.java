package com.utadeo.siger.models.entitys;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotEmpty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subject")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Subject implements Serializable{
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@NotEmpty
	private String name;
	@Column(name = "pre_requisite")
	private Subject preRequisite;
	@Column(name = "credits_amount")
	private Integer creditsAmount;
	
	private static final long serialVersionUID = 1L;
	
}
