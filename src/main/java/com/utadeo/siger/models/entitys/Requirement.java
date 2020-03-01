package com.utadeo.siger.models.entitys;

import java.io.Serializable;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotEmpty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "requirement")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Requirement implements Serializable{
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@NotEmpty
	private AcademicProgram program;
	@NotEmpty
	private Syllabus syllabus;
	@NotEmpty
	@ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	private User user;
	@NotEmpty
	@Column(name = "subject_to_study")
	private Subject subjectToStudy;
	@NotEmpty
	@Column(name = "requirement_to_quit")
	private Subject requirementToQuit;
	@NotEmpty
	private String justification;
	private static final long serialVersionUID = 1L;

}
