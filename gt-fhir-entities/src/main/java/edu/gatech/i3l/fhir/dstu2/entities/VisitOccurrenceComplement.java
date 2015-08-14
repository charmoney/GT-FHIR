/**
 * 
 */
package edu.gatech.i3l.fhir.dstu2.entities;

import java.util.Date;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.Table;

import org.hibernate.envers.Audited;

import ca.uhn.fhir.jpa.entity.IResourceEntity;
import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.dstu2.composite.ResourceReferenceDt;
import ca.uhn.fhir.model.dstu2.resource.Encounter;
import ca.uhn.fhir.model.dstu2.valueset.EncounterStateEnum;

/**
 * @author Myung Choi
 *
 */
@Entity
@Table(name="f_visit_occurrence")
@PrimaryKeyJoinColumn(name="visit_occurrence_id")
@Audited
public class VisitOccurrenceComplement extends VisitOccurrence {
	
	@ManyToOne(fetch=FetchType.LAZY, cascade={CascadeType.MERGE})
	@JoinColumn(name="episode_of_care_id")
	private EpisodeOfCare episodeOfCare;
	
	@Column(name="status")
	private String status;
	
	@Column(name="note")
	@Lob
	private String note;
	
	public VisitOccurrenceComplement() {
		super();
	}
	
	public VisitOccurrenceComplement(Long id, Person person, Date startDate, Date endDate,
			Concept placeOfServiceConcept, CareSite careSite, String placeOfServiceSourceValue,
			EpisodeOfCare episodeOfCare, String status, String note) {
		super(id, person, startDate, endDate, placeOfServiceConcept, careSite, placeOfServiceSourceValue);
		
		this.episodeOfCare = episodeOfCare;
		this.note = note;
		
	}
	
	public EpisodeOfCare getEpisodeOfCare() {
		return episodeOfCare;
	}
	
	public void setEpisodeOfCare(EpisodeOfCare episodeOfCare) {
		this.episodeOfCare = episodeOfCare;
	}
	
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
	public String getNote() {
		return note;
	}
	
	public void setNote(String note) {
		this.note = note;
	}
	
	@Override
	public Encounter getRelatedResource() {
		Encounter encounter = super.getRelatedResource();

		// set status
		if (status.equalsIgnoreCase("planned"))
			encounter.setStatus(EncounterStateEnum.PLANNED);
		else if (status.equalsIgnoreCase("arrived"))
			encounter.setStatus(EncounterStateEnum.ARRIVED);
		else if (status.equalsIgnoreCase("in-progress"))
			encounter.setStatus(EncounterStateEnum.IN_PROGRESS);
		else if (status.equalsIgnoreCase("onleave"))
			encounter.setStatus(EncounterStateEnum.ON_LEAVE);
		else if (status.equalsIgnoreCase("finished"))
			encounter.setStatus(EncounterStateEnum.FINISHED);
		else if (status.equalsIgnoreCase("cancelled"))
			encounter.setStatus(EncounterStateEnum.CANCELLED);
		
		// set episode of care.
		EpisodeOfCare episodeOfCare = getEpisodeOfCare();
		if (episodeOfCare != null) {
			ResourceReferenceDt episodeReference = new ResourceReferenceDt(episodeOfCare.getIdDt());
			encounter.setEpisodeOfCare(episodeReference);
		}

		// set Reason
		// TODO: note or linked condition may have this information.
		
		return encounter;
	}

	@Override
	//Not mandatory
	public IResourceEntity constructEntityFromResource(IResource resource) {
		//Encounter encounter = (Encounter) resource;
		return this;
	}
	
	
}