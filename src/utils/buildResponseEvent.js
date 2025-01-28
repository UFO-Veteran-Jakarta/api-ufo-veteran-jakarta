exports.buildResponse = async (oldData, updateData, updatedEvent) => {
  let responseData = {
    id: updatedEvent.id,
  };

  const updates = [];

  const addUpdate = (field, oldField, newField) => {
    responseData[`old_${field}`] = oldField;
    responseData[`new_${field}`] = newField;
    updates.push(field);
  };

  if (updateData.name) {
    addUpdate('name', oldData.name, updatedEvent.name);
    addUpdate('slug', oldData.slug, updatedEvent.slug);
  }

  if (updateData.cover) {
    addUpdate('cover', oldData.cover, updatedEvent.cover);
  }

  if (updateData.cover_landscape) {
    addUpdate('cover_landscape', oldData.cover_landscape, updatedEvent.cover_landscape);
  }

  if (updateData.start_event_date) {
    addUpdate('start_event_date', oldData.start_event_date, updatedEvent.start_event_date);
  }

  if (updateData.end_event_date) {
    addUpdate('end_event_date', oldData.end_event_date, updatedEvent.end_event_date);
  }

  if (updateData.start_event_time) {
    addUpdate('start_event_time', oldData.start_event_time, updatedEvent.start_event_time);
  }

  if (updateData.end_event_time) {
    addUpdate('end_event_time', oldData.end_event_time, updatedEvent.end_event_time);
  }

  if (updateData.registration_start_date) {
    addUpdate('registration_start_date', oldData.registration_start_date, updatedEvent.registration_start_date);
  }

  if (updateData.registration_end_date) {
    addUpdate('registration_end_date', oldData.registration_end_date, updatedEvent.registration_end_date);
  }

  if (updateData.registration_start_time) {
    addUpdate('registration_start_time', oldData.registration_start_time, updatedEvent.registration_start_time);
  }

  if (updateData.registration_end_time) {
    addUpdate('registration_end_time', oldData.registration_end_time, updatedEvent.registration_end_time);
  }

  if (updateData.body) {
    addUpdate('body', oldData.body, updatedEvent.body);
  }

  if (updateData.snippets) {
    addUpdate('snippets', oldData.snippets, updatedEvent.snippets);
  }

  if (updateData.link_registration) {
    addUpdate('link_registration', oldData.link_registration, updatedEvent.link_registration);
  }

  if (updateData.location) {
    addUpdate('location', oldData.location, updatedEvent.location);
  }

  // Add timestamps at the end
  responseData = {
    ...responseData,
    created_at: updatedEvent.created_at,
    updated_at: updatedEvent.updated_at,
    deleted_at: updatedEvent.deleted_at,
  };

  const responseMessage = `Successfully updated event ${updates.join(', ')}.`;

  return [responseMessage, responseData];
};