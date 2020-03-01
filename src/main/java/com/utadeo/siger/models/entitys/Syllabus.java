package com.utadeo.siger.models.entitys;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "syllabus")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Syllabus implements Serializable{
	
	private static final long serialVersionUID = 1L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long code;
	@NotEmpty
	private String name;
	@Temporal(TemporalType.DATE)
	@DateTimeFormat(pattern = "yyyy")
	@NotNull
	private Date year;
	@OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	private List<User> users;
	@OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	private List<Subject> subjects;
	
}
