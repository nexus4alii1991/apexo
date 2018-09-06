import './doctors-listing.scss';

import * as React from 'react';

import {
	CommandBar,
	IContextualMenuItem,
	Panel,
	PanelType,
	PersonaSize,
	Pivot,
	PivotItem,
	PrimaryButton,
	TextField,
	IconButton
} from 'office-ui-fabric-react';
import { Doctor, doctors } from '../data';
import { Label, LabelType, getRandomLabelType } from '../../../assets/components/label/label.component';
import { appointmentsComponents, appointmentsData } from '../../appointments';
import { computed, observable } from 'mobx';
import { Row, Col } from '../../../assets/components/grid/index';
import { API } from '../../../core';
import { AppointmentThumb } from '../../../assets/components/appointment-thumb/appointment-thumb';
import { DataTable } from '../../../assets/components/data-table/data-table.component';
import { Profile } from '../../../assets/components/profile/profile';
import { TagInput } from '../../../assets/components/tag-input/tag-input';
import { observer } from 'mobx-react';
import { settings } from '../../../modules/settings/data';
import { Section } from '../../../assets/components/section/section';

@observer
export class DoctorsListing extends React.Component<{}, {}> {
	@observable selectedId: string = API.router.currentLocation.split('/')[1];

	@computed
	get selectedDoctorIndex() {
		return doctors.getIndexByID(this.selectedId);
	}

	@computed
	get doctor() {
		return doctors.list[this.selectedDoctorIndex];
	}

	render() {
		return (
			<div className="doctors-component p-15 p-l-10 p-r-10">
				<Row gutter={16}>
					<Col lg={16}>
						<DataTable
							onDelete={(id) => {
								doctors.deleteModal(id);
							}}
							className={'doctors-data-table'}
							heads={[ 'Profile', 'Last Appointment', 'Next Appointment' ]}
							rows={doctors.list.map((doctor) => ({
								id: doctor._id,
								cells: [
									{
										dataValue: doctor.name,
										component: (
											<Profile
												name={doctor.name}
												secondaryText={doctor.email}
												tertiaryText={`${doctor.nextAppointments.length} Upcoming appointments`}
												onClick={() => {
													this.selectedId = doctor._id;
												}}
												size={matchMedia('(max-width: 767px)').matches ? 3 : undefined}
											/>
										),
										onClick: () => {
											this.selectedId = doctor._id;
										},
										className: 'no-label'
									},
									{
										dataValue: (doctor.lastAppointment || { date: 0 }).date,
										component: doctor.lastAppointment ? (
											<AppointmentThumb appointment={doctor.lastAppointment} small />
										) : (
											'Not registered'
										),
										className: 'hidden-xs'
									},
									{
										dataValue: (doctor.nextAppointment || { date: Infinity }).date,
										component: doctor.nextAppointment ? (
											<AppointmentThumb appointment={doctor.nextAppointment} small />
										) : (
											'Not registered'
										),
										className: 'hidden-xs'
									}
								]
							}))}
							commands={[
								{
									key: 'addNew',
									title: 'Add new',
									name: 'Add New',
									onClick: () => {
										const doctor = new Doctor();
										doctors.list.push(doctor);
										this.selectedId = doctor._id;
									},
									iconProps: {
										iconName: 'Add'
									}
								}
							]}
						/>
					</Col>
					<Col lg={8}>
						<table className="ms-table duty-table">
							<tbody>
								{[
									'Sunday',
									'Monday',
									'Tuesday',
									'Wednesday',
									'Thursday',
									'Friday',
									'Saturday'
								].map((dayName, index) => {
									return (
										<tr key={dayName}>
											<th className="day-name">{dayName}</th>
											<td className="doctor">
												{doctors.list
													.filter((doctor) => doctor.onDutyDays.indexOf(dayName) !== -1)
													.map((doctor) => {
														return (
															<Profile
																className=""
																size={PersonaSize.large}
																key={doctor._id}
																name={doctor.name}
																tertiaryText={`${(doctor.weeksAppointments[index] || [])
																	.length} appointments for ${dayName.toLowerCase()}`}
																onClick={() => {
																	this.selectedId = doctor._id;
																}}
															/>
														);
													})}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</Col>
				</Row>

				{this.doctor ? (
					<Panel
						isOpen={!!this.doctor}
						type={PanelType.medium}
						closeButtonAriaLabel="Close"
						isLightDismiss={true}
						onDismiss={() => {
							this.selectedId = '';
						}}
						onRenderNavigation={() => (
							<Row className="panel-heading">
								<Col span={20}>
									{this.doctor.name ? (
										<Profile
											name={this.doctor.name}
											secondaryElement={<span>Operating Doctor</span>}
											tertiaryText={this.doctor.phone}
											size={3}
										/>
									) : (
										<p />
									)}
								</Col>
								<Col span={4} className="close">
									<IconButton
										iconProps={{ iconName: 'cancel' }}
										onClick={() => {
											this.selectedId = '';
										}}
									/>
								</Col>
							</Row>
						)}
					>
						<div className="doctor-editor">
							<Section title="Doctor information" showByDefault>
								<div className="doctor-input">
									<TextField
										label="Name: "
										prefix="Dr."
										value={this.doctor.name}
										onChanged={(val) => (this.doctor.name = val)}
									/>
								</div>

								<div className="doctor-input">
									<label>Days on duty: </label>
									<TagInput
										strict={true}
										placeholder={'Enter day name...'}
										options={this.doctor.days.map((x) => ({ key: x, text: x }))}
										onChange={(newVal) => {
											this.doctor.onDutyDays = newVal.map((x) => x.text);
										}}
										value={this.doctor.onDutyDays.map((x) => ({ text: x, key: x }))}
										sortFunction={(a, b) =>
											this.doctor.days.indexOf(a.text) - this.doctor.days.indexOf(b.text)}
									/>
								</div>
							</Section>

							{settings.getSetting('doctor_contact') ? (
								<Section title="Contact Details" showByDefault>
									<Row gutter={12}>
										<Col sm={12}>
											<div className="doctor-input">
												<TextField
													label="Phone Number: "
													value={this.doctor.phone}
													onChanged={(val) => (this.doctor.phone = val)}
												/>
											</div>
										</Col>
										<Col sm={12}>
											<div className="doctor-input">
												<TextField
													label="Email: "
													value={this.doctor.email}
													onChanged={(val) => (this.doctor.email = val)}
												/>
											</div>
										</Col>
									</Row>
								</Section>
							) : (
								''
							)}
						</div>
					</Panel>
				) : (
					''
				)}
			</div>
		);
	}
}
