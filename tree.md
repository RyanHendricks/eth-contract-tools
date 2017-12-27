# Directory to MindMap

[Source](https://gist.github.com/karlarao/c14413ba48e84f4de4dac84a297da1f6/revisions)

## Change Directory in the following code
```bash
tree -d -L 8 -X -I tmp /home/ryan/Git/protocol/contracts | sed 's/directory/node/g'| sed 's/name/TEXT/g' | sed 's/tree/map/g' | sed '$d' | sed '$d' | sed '$d'|  sed "1d" | sed 's/report/\/map/g' | sed 's/<map>/<map version="1.0.1">/g' > /home/ryan/Git/protocol/contracts/Map.mm
```

## to filter multiple folders do the following
```bash
tree -L 7 -I "tmp|node_modules|bower_components"
```

## Both were combined to produce which gave the .mm file for MindMap import

```bash
tree -L 9 -X -I "tmp|node_modules|bower_components" /home/ryan/Git/protocol/TOKENBNK | sed 's/directory/node/g'| sed 's/name/TEXT/g' | sed 's/tree/map/g' | sed '$d' | sed '$d' | sed '$d'|  sed "1d" | sed 's/report/\/map/g' | sed 's/<map>/<map version="1.0.1">/g' > /home/ryan/Git/protocol/TOKENBNK/Map2.mm
```
The final step is to change every word *text* to *node* AND remove the last line in the file with the directory count before import although I imagine it could be accomplished by altering the cli command

## The Result

```xml
<map version="1.0.1">
  <node TEXT="/home/ryan/Git/CoinHealth/resources/assets/js/components">
    <node TEXT="Activities">
      <node TEXT="Activity.vue"></node>
      <node TEXT="Appointments.vue"></node>
      <node TEXT="Directories.vue"></node>
      <node TEXT="Medications.vue"></node>
      <node TEXT="mixins">
        <node TEXT="activity.js"></node>
        <node TEXT="template.js"></node>
        <node TEXT="type.js"></node>
      </node>
      <node TEXT="Permissions.vue"></node>
      <node TEXT="Templates">
        <node TEXT="Appointments">
          <node TEXT="Approval.vue"></node>
          <node TEXT="PatientApprovedAppointment.vue"></node>
          <node TEXT="PatientDeclinedAppointment.vue"></node>
          <node TEXT="PatientHasSetAppointment.vue"></node>
          <node TEXT="ProviderApprovedAppointment.vue"></node>
          <node TEXT="ProviderDeclinedAppointment.vue"></node>
          <node TEXT="ProviderHasSetAppointment.vue"></node>
          <node TEXT="ProviderSuggestedAnAppointment.vue"></node>
          <node TEXT="ProviderUpdatedAppointment.vue"></node>
          <node TEXT="Suggest.vue"></node>
          <node TEXT="Template.vue"></node>
        </node>
        <node TEXT="Directories">
          <node TEXT="Appointment.vue"></node>
          <node TEXT="Template.vue"></node>
          <node TEXT="UserHasSavedProvider.vue"></node>
          <node TEXT="UserHasUnsavedProvider.vue"></node>
        </node>
        <node TEXT="Permissions">
          <node TEXT="InvitationWasAccepted.vue"></node>
          <node TEXT="InvitationWasDeclined.vue"></node>
          <node TEXT="PatientApprovedRequest.vue"></node>
          <node TEXT="PatientDeniedRequest.vue"></node>
          <node TEXT="ProviderRequestedToProvider.vue"></node>
          <node TEXT="ProviderSentRequest.vue"></node>
          <node TEXT="Template.vue"></node>
          <node TEXT="UserHasJoined.vue"></node>
          <node TEXT="UserSentInvitation.vue"></node>
        </node>
      </node>
    </node>
    <node TEXT="Allergies">
      <node TEXT="Add.vue"></node>
      <node TEXT="Allergy.vue"></node>
    </node>
    <node TEXT="Appointments">
      <node TEXT="AppointmentModal.vue"></node>
      <node TEXT="Appointment.vue"></node>
      <node TEXT="Delete.vue"></node>
      <node TEXT="EditAppointment.vue"></node>
      <node TEXT="NewAppointment.vue"></node>
    </node>
    <node TEXT="Attachments">
      <node TEXT="node.vue"></node>
    </node>
    <node TEXT="CardPicture.vue"></node>
    <node TEXT="CareParrotCard.vue"></node>
    <node TEXT="Chat.vue"></node>
    <node TEXT="Dashboard">
      <node TEXT="Clinic.vue"></node>
    </node>
    <node TEXT="DataTable.vue"></node>
    <node TEXT="Directories">
      <node TEXT="Agents">
        <node TEXT="Card.vue"></node>
        <node TEXT="ModalPremium.vue"></node>
        <node TEXT="ModalPreview.vue"></node>
        <node TEXT="ModalSave.vue"></node>
      </node>
      <node TEXT="DoctorCard.vue"></node>
      <node TEXT="ModalPremium.vue"></node>
      <node TEXT="ModalPreview.vue"></node>
      <node TEXT="ModalSave.vue"></node>
      <node TEXT="SupportGroup">
        <node TEXT="Card.vue"></node>
      </node>
    </node>
    <node TEXT="FamilyMembers.vue"></node>
    <node TEXT="Flags">
      <node TEXT="Add.vue"></node>
      <node TEXT="Edit.vue"></node>
      <node TEXT="Flag.vue"></node>
      <node TEXT="List.vue"></node>
    </node>
    <node TEXT="Gamification">
      <node TEXT="Modal.vue"></node>
    </node>
    <node TEXT="Laboratory">
      <node TEXT="Add.vue"></node>
      <node TEXT="EditList.vue"></node>
    </node>
    <node TEXT="Map2.mm"></node>
    <node TEXT="Map.mm"></node>
    <node TEXT="Medical">
      <node TEXT="Abuse.vue"></node>
      <node TEXT="AlcoholDrug.vue"></node>
      <node TEXT="Allergies.vue"></node>
      <node TEXT="AllergyEdit.vue"></node>
      <node TEXT="Caffeine.vue"></node>
      <node TEXT="Diet.vue"></node>
      <node TEXT="FamilyHistory.vue"></node>
      <node TEXT="Habits.vue"></node>
      <node TEXT="InjuryEdit.vue"></node>
      <node TEXT="Injury.vue"></node>
      <node TEXT="Medication.vue"></node>
      <node TEXT="Problems.vue"></node>
      <node TEXT="Questionnaire.vue"></node>
      <node TEXT="Stress.vue"></node>
      <node TEXT="Surgery.vue"></node>
      <node TEXT="Tobacco.vue"></node>
      <node TEXT="Vitals.vue"></node>
    </node>
    <node TEXT="Medications">
      <node TEXT="List.vue"></node>
      <node TEXT="MedicationPanel.vue"></node>
    </node>
    <node TEXT="Messages">
      <node TEXT="AttachednodePreview.vue"></node>
      <node TEXT="Conversations">
        <node TEXT="Conversation.vue"></node>
        <node TEXT="List.vue"></node>
      </node>
      <node TEXT="mixins">
        <node TEXT="mixin.js"></node>
      </node>
      <node TEXT="Participants">
        <node TEXT="List.vue"></node>
        <node TEXT="Participant.vue"></node>
      </node>
      <node TEXT="PresenceNotification.vue"></node>
      <node TEXT="ReplyAttachment.vue"></node>
      <node TEXT="ReplyList.vue"></node>
    </node>
    <node TEXT="Patients">
      <node TEXT="AddPatient.vue"></node>
      <node TEXT="List.vue"></node>
      <node TEXT="NewAppointment.vue"></node>
    </node>
    <node TEXT="Payments">
      <node TEXT="AddPayment2.vue"></node>
      <node TEXT="AddPayment.vue"></node>
      <node TEXT="ChangeStatus.vue"></node>
      <node TEXT="CreatePayment.vue"></node>
      <node TEXT="List2.vue"></node>
      <node TEXT="List.vue"></node>
    </node>
    <node TEXT="Permissions">
      <node TEXT="CheckPermissions.vue"></node>
      <node TEXT="Form.vue"></node>
      <node TEXT="Preview.vue"></node>
      <node TEXT="Request.vue"></node>
      <node TEXT="Respond.vue"></node>
    </node>
    <node TEXT="Problem">
      <node TEXT="Add.vue"></node>
      <node TEXT="EditList.vue"></node>
    </node>
    <node TEXT="SubscribersList.vue"></node>
    <node TEXT="UploadPhoto.vue"></node>
    <node TEXT="Vitals">
      <node TEXT="Vital.Vue"></node>
    </node>
  </node>
  </map>
```

