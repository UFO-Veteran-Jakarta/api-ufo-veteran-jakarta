const memberService = require('../services/memberService');

const formatMember = (member) => {
  return {
    id: member.member_id,
    name: member.member_name,
    division: {
      id: member.division_id,
      name: member.division_name,
      image: member.division_image,
    },
    position: {
      id: member.position_id,
      name: member.position_name,
    },
    image: member.member_image,
    angkatan: member.angkatan,
    instagram: member.instagram,
    linkedin: member.linkedin,
    whatsapp: member.whatsapp,
    created_at: member.created_at,
    updated_at: member.updated_at,
    deleted_at: member.deleted_at,
  };
};

const getFormattedMembers = async () => {
  const members = await memberService.getAllMembers();
  return members.map(formatMember);
};

const getFormattedMember = async (id) => {
  const member = await memberService.getMemberById(id);
  return formatMember(member);
};

const addFormattedMember = async (data) => {
  const newMember = await memberService.addMember(data);
  return formatMember(newMember);
};

const updateFormattedMember = async (id, data) => {
  const updatedMember = await memberService.updateMemberById(id, data);
  return formatMember(updatedMember);
};

module.exports = {
  getFormattedMembers,
  getFormattedMember,
  addFormattedMember,
  updateFormattedMember,
  formatMember,
};
